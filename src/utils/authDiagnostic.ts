import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';

export interface DiagnosticResult {
  timestamp: string;
  auth: {
    isSignedIn: boolean;
    uid: string | null;
    email: string | null;
    emailVerified: boolean | null;
    providerIds: string[];
  };
  userDoc: {
    exists: boolean;
    path: string;
    data: any | null;
    role: string | null;
    status: string | null;
    isValidRole: boolean;
  };
  systemInit: {
    docExists: boolean;
    setupCompleted: boolean;
    isSystemInitOpen: boolean;
  };
  permissionTests: Record<string, {
    success: boolean;
    count?: number;
    error?: string;
    code?: string;
  }>;
  summary: {
    hasPermissionError: boolean;
    detectedIssues: string[];
    recommendations: string[];
  };
}

const VALID_STAFF_ROLES = [
  'super administrator', 'super admin', 'super_administrator', 'super_admin', 'superadmin',
  'owner', 'admin', 'administrator', 'manager', 'technician', 'staff'
];

/**
 * Runs a complete diagnostic audit of Firebase Auth state and Firestore role-based security permissions.
 * Identifies the exact root cause of 'Missing or insufficient permissions' errors.
 */
export async function runAuthDiagnostic(): Promise<DiagnosticResult> {
  const now = new Date().toISOString();
  console.group('%c[Auth & Firestore Permission Diagnostic]', 'color: #0284c7; font-weight: bold; font-size: 14px;');
  console.log('Diagnostic initiated at:', now);

  const currentUser = auth.currentUser;
  const isSignedIn = !!currentUser;
  
  const authState = {
    isSignedIn,
    uid: currentUser?.uid || null,
    email: currentUser?.email || null,
    emailVerified: currentUser?.emailVerified || null,
    providerIds: currentUser?.providerData?.map(p => p.providerId) || [],
  };

  console.log('%c1. Firebase Auth State:', 'color: #0369a1; font-weight: bold;', authState);

  // 2. Fetch User Document
  let userDocExists = false;
  let userDocPath = `users/${currentUser?.uid || 'unauthenticated'}`;
  let userDocData: any = null;
  let userRole: string | null = null;
  let userStatus: string | null = null;
  let isValidRole = false;

  if (currentUser) {
    try {
      const uRef = doc(db, 'users', currentUser.uid);
      const uSnap = await getDoc(uRef);
      userDocExists = uSnap.exists();
      if (userDocExists) {
        userDocData = uSnap.data();
        userRole = userDocData?.role || null;
        userStatus = userDocData?.status || null;
        if (userRole) {
          isValidRole = VALID_STAFF_ROLES.includes(userRole.trim().toLowerCase());
        }
      } else {
        console.warn(`[Diagnostic Notice]: User document not found at 'users/${currentUser.uid}'. Checking lookup by email...`);
        if (currentUser.email) {
          const emailQ = query(collection(db, 'users'), limit(5));
          const emailSnap = await getDocs(emailQ).catch(() => null);
          if (emailSnap && !emailSnap.empty) {
            const match = emailSnap.docs.find(d => d.data().email?.toLowerCase() === currentUser.email?.toLowerCase());
            if (match) {
              console.warn(`[Diagnostic Notice]: User doc exists under doc ID '${match.id}' rather than Firebase Auth UID '${currentUser.uid}'.`);
            }
          }
        }
      }
    } catch (uErr: any) {
      console.error('[Diagnostic Error]: Failed to read user document:', uErr);
    }
  }

  const userDocInfo = {
    exists: userDocExists,
    path: userDocPath,
    data: userDocData,
    role: userRole,
    status: userStatus,
    isValidRole,
  };

  console.log('%c2. User Document & Role in Firestore:', 'color: #0369a1; font-weight: bold;', userDocInfo);

  // 3. System Init State
  let systemInitDocExists = false;
  let setupCompleted = false;
  let isSystemInitOpen = true;

  try {
    const sysSnap = await getDoc(doc(db, 'settings', 'system_init'));
    systemInitDocExists = sysSnap.exists();
    if (systemInitDocExists) {
      setupCompleted = !!sysSnap.data()?.setupCompleted;
      isSystemInitOpen = !setupCompleted;
    }
  } catch (sysErr) {
    console.warn('[Diagnostic Notice]: Could not read settings/system_init:', sysErr);
  }

  const systemInitInfo = {
    docExists: systemInitDocExists,
    setupCompleted,
    isSystemInitOpen,
  };

  console.log('%c3. System Initialization Status:', 'color: #0369a1; font-weight: bold;', systemInitInfo);

  // 4. Test Permissions on Administrative Collections
  const collectionsToTest = [
    'users',
    'bookings',
    'quotes',
    'customers',
    'contacts',
    'auditLogs',
    'roles',
    'settings'
  ];

  const permissionTests: Record<string, { success: boolean; count?: number; error?: string; code?: string }> = {};
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!isSignedIn) {
    issues.push('Firebase Auth user is NOT signed in (`auth.currentUser` is null). Restricted Firestore reads/writes will fail.');
    recommendations.push('Log in via Firebase Authentication or complete staff sign in.');
  } else if (!userDocExists) {
    issues.push(`User document 'users/${currentUser.uid}' does NOT exist in Firestore. Security rules rely on 'getUserData().role'.`);
    recommendations.push(`Create user profile document at 'users/${currentUser.uid}' with role 'Super Administrator' or 'Admin'.`);
  } else if (!isValidRole) {
    issues.push(`User role '${userRole}' in 'users/${currentUser.uid}' is not in allowed staff roles list.`);
    recommendations.push(`Update 'role' field in document 'users/${currentUser.uid}' to 'Super Administrator' or 'Admin'.`);
  }

  if (userStatus === 'Suspended' || userStatus === 'Disabled') {
    issues.push(`Account status is '${userStatus}', which restricts access.`);
    recommendations.push(`Update user status in 'users/${currentUser.uid}' to 'Active'.`);
  }

  console.log('%c4. Testing Firestore Collection Access:', 'color: #0369a1; font-weight: bold;');

  for (const colName of collectionsToTest) {
    try {
      const q = query(collection(db, colName), limit(3));
      const snap = await getDocs(q);
      permissionTests[colName] = {
        success: true,
        count: snap.size,
      };
      console.log(`  ✓ Read on '${colName}': Allowed (${snap.size} docs fetched)`);
    } catch (testErr: any) {
      const errMsg = testErr?.message || String(testErr);
      const errCode = testErr?.code || 'unknown';
      permissionTests[colName] = {
        success: false,
        error: errMsg,
        code: errCode,
      };
      console.error(`  ✗ Read on '${colName}': DENIED (${errCode}) - ${errMsg}`);
      if (errCode === 'permission-denied' || errMsg.includes('insufficient permissions')) {
        issues.push(`Permission DENIED when reading collection '${colName}'.`);
      }
    }
  }

  const hasPermissionError = Object.values(permissionTests).some(t => !t.success);

  if (hasPermissionError && recommendations.length === 0) {
    recommendations.push('Ensure Firestore Security Rules are deployed and `isStaffOrAdmin()` covers the user role string.');
  }

  const summary = {
    hasPermissionError,
    detectedIssues: issues,
    recommendations,
  };

  console.log('%c5. Diagnostic Summary & Recommendations:', 'color: #0369a1; font-weight: bold;', summary);
  console.groupEnd();

  const result: DiagnosticResult = {
    timestamp: now,
    auth: authState,
    userDoc: userDocInfo,
    systemInit: systemInitInfo,
    permissionTests,
    summary,
  };

  return result;
}

// Attach to window object in browser environment for developer console invocation
if (typeof window !== 'undefined') {
  (window as any).runAuthDiagnostic = runAuthDiagnostic;
}
