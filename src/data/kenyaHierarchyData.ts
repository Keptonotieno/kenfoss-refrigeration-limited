export interface SubCountyData {
  name: string;
  wards: string[];
}

export interface CountyHierarchy {
  county: string;
  subCounties: SubCountyData[];
}

export const RAW_COUNTY_DATA: Record<string, SubCountyData[]> = {
  'Nairobi': [
    { name: 'Westlands', wards: ['Parklands/Highridge', 'Karura', 'Kangemi', 'Mountain View', 'Kitisuru', 'Westlands CBD', 'Spring Valley'] },
    { name: 'Dagoretti North', wards: ['Kilimani', 'Kawangware', 'Gatina', 'Kileleshwa', 'Lavington', 'Kipkabus'] },
    { name: 'Dagoretti South', wards: ['Mutu-ini', 'Ngando', 'Riruta', 'Uthiru/Ruthimitu', 'Waithaka'] },
    { name: 'Lang\'ata', wards: ['Karen', 'Nairobi West', 'Mugumo-ini', 'South C', 'Nyayo Highrise'] },
    { name: 'Kibra', wards: ['Laini Saba', 'Lindi', 'Makina', 'Woodley/Kenyatta Golf Course', 'Sarang\'ombe'] },
    { name: 'Roysambu', wards: ['Roysambu Town', 'Garden Estate', 'Githurai 44', 'Kahawa West', 'Zimmerman', 'Kahawa Estate'] },
    { name: 'Kasarani', wards: ['Clay City', 'Mwiki', 'Kasarani Town', 'Njiru', 'Ruai', 'Kamulu'] },
    { name: 'Embakasi South', wards: ['Imara Daima', 'Pipeline', 'Kware', 'Mukuru Kwa Njenga', 'Mukuru Kwa Ruben'] },
    { name: 'Embakasi North', wards: ['Kariobangi North', 'Dandora Area I', 'Dandora Area II', 'Dandora Area III', 'Dandora Area IV'] },
    { name: 'Embakasi Central', wards: ['Kayole North', 'Kayole Central', 'Kayole South', 'Koma Rock', 'Matopeni/Spring Valley'] },
    { name: 'Embakasi East', wards: ['Upper Savanna', 'Lower Savanna', 'Embakasi Central', 'Utawala', 'Mihango'] },
    { name: 'Embakasi West', wards: ['Umoja I', 'Umoja II', 'Mowlem', 'Kariobangi South', 'Buruburu'] },
    { name: 'Makadara', wards: ['Maringo/Hamza', 'Viwandani', 'Harambee', 'Makadara', 'South B'] },
    { name: 'Kamukunji', wards: ['Pumwani', 'Eastleigh North', 'Eastleigh South', 'Airbase', 'California'] },
    { name: 'Starehe', wards: ['Nairobi Central CBD', 'Ngara', 'Pangani', 'Ziwani/Kariokor', 'Landimawe', 'South B North'] },
    { name: 'Mathare', wards: ['Hospital', 'Mabitini', 'Huruma', 'Ngei', 'Mlango Kubwa', 'Kiamaiko'] }
  ],
  'Kiambu': [
    { name: 'Ruiru', wards: ['Kahawa Sukari', 'Kahawa Wendani', 'Kiuu', 'Membley', 'Ruiru Town/Biashara', 'Gitothua', 'Gatongora', 'Tatu City'] },
    { name: 'Thika Town', wards: ['Township/CBD', 'Kamenu', 'Hospital', 'Gatuanyaga', 'Ngoliba', 'Del Monte Zone'] },
    { name: 'Juja', wards: ['Murera', 'Theta', 'Juja Town', 'Kalimoni', 'Witeithie', 'HighPoint'] },
    { name: 'Kiambu', wards: ['Ting\'ang\'a', 'Township', 'Riabai', 'Ndumberi', 'Kirigiti'] },
    { name: 'Kikuyu', wards: ['Karai', 'Ondiri', 'Kikuyu Town', 'Sigona', 'Muguga'] },
    { name: 'Kabete', wards: ['Gitaru', 'Lower Kabete', 'Nyadhuna', 'Kabete', 'Uthiru'] },
    { name: 'Limuru', wards: ['Bibirioni', 'Limuru Central', 'Ndeiya', 'Limuru East', 'Tigoni/Ngecha'] },
    { name: 'Karuri', wards: ['Karuri Town', 'Banana', 'Muchatha', 'Ruaka', 'Kiamaguru'] },
    { name: 'Githunguri', wards: ['Githunguri Town', 'Githiga', 'Ikinu', 'Ngewa', 'Komothai'] },
    { name: 'Gatundu South', wards: ['Kiamwangi', 'Kiganjo', 'Ndarugu', 'Ng\'enda'] },
    { name: 'Gatundu North', wards: ['Gituamba', 'Githobokoni', 'Chania', 'Mang\'u'] },
    { name: 'Lari', wards: ['Kinale', 'Kijabe', 'Nyanduma', 'Kamburu', 'Lari/Kirenga'] }
  ],
  'Mombasa': [
    { name: 'Mvita', wards: ['Mvita CBD', 'Old Town', 'Tudor', 'Tononoka', 'Shimanzi/Ganjoni'] },
    { name: 'Nyali', wards: ['Frere Town', 'Ziwa La Ng\'ombe', 'Mkomani', 'Kongowea', 'Kadzandani', 'Nyali Estate'] },
    { name: 'Kisauni', wards: ['Mjambere', 'Junda', 'Bamburi', 'Mtwapa Border', 'Shanzu'] },
    { name: 'Changamwe', wards: ['Port Reitz', 'Kipevu', 'Airport', 'Changamwe CBD', 'Chaani'] },
    { name: 'Jomvu', wards: ['Jomvu Kuu', 'Miritini SGR Hub', 'Mikindani'] },
    { name: 'Likoni', wards: ['Mtongwe', 'Shika Adabu', 'Bofu', 'Likoni CBD', 'Timbwani', 'Shelly Beach'] }
  ],
  'Nakuru': [
    { name: 'Nakuru Town East', wards: ['Biashara', 'Kivumbini', 'Flamingo', 'Menengai', 'Nakuru East CBD'] },
    { name: 'Nakuru Town West', wards: ['Barut', 'London', 'Kaptembwa', 'Kapkures', 'Rhonda'] },
    { name: 'Naivasha', wards: ['Biashara/CBD', 'Hell\'s Gate', 'Lake View', 'Mai Mahiu', 'Maeella', 'Olkaria', 'Naivasha East'] },
    { name: 'Gilgil', wards: ['Gilgil Town', 'Elementaita', 'Mbaruk/Eburu', 'Malewa West', 'Murindat'] },
    { name: 'Molo', wards: ['Mariashoni', 'Elburgon', 'Tinet', 'Molo Town'] },
    { name: 'Njoro', wards: ['Mau Narok', 'Mauche', 'Kihingo', 'Njoro Town/Egerton', 'Lare'] },
    { name: 'Bahati', wards: ['Dundori', 'Kiamaina', 'Lanet/Umoja', 'Bahati Town', 'Kabatini'] },
    { name: 'Subukia', wards: ['Subukia East', 'Subukia West', 'Waseges'] },
    { name: 'Rongai', wards: ['Menengai West', 'Soin', 'Visoi', 'Salgaa', 'Mosop'] },
    { name: 'Kuresoi North', wards: ['Kiptororo', 'Nyota', 'Sirikwa', 'Kamara'] },
    { name: 'Kuresoi South', wards: ['Amalo', 'Keringet', 'Kiptagich', 'Tinet'] }
  ],
  'Kisumu': [
    { name: 'Kisumu Central', wards: ['Railways', 'Migosi', 'Shauri Moyo', 'Kondele', 'Market Milimani', 'Kisumu CBD'] },
    { name: 'Kisumu East', wards: ['Kajulu', 'Kolwa East', 'Manyatta \'B\'', 'Nyalenda \'A\'', 'Kolwa Central'] },
    { name: 'Kisumu West', wards: ['South West Kisumu', 'Central Kisumu', 'Kisumu West', 'North West Kisumu', 'Otonglo'] },
    { name: 'Muhoroni', wards: ['Miwani', 'Ombeyi', 'Masogo/Nyang\'oma', 'Chemelil', 'Muhoroni Town'] },
    { name: 'Nyando', wards: ['East Kano/Wawidhi', 'Awasi/Onjiko', 'Ahero Town', 'Kabonyo/Kanyagwal', 'Kobura'] },
    { name: 'Nyakach', wards: ['South West Nyakach', 'North Nyakach', 'Central Nyakach', 'West Nyakach', 'South East Nyakach'] },
    { name: 'Seme', wards: ['West Seme', 'Central Seme', 'East Seme', 'North Seme'] }
  ],
  'Uasin Gishu': [
    { name: 'Kapseret', wards: ['Simat/Kapseret', 'Kipkenyo', 'Ngeria', 'Megun', 'Langas'] },
    { name: 'Ainabkoi', wards: ['Kapsoya', 'Kaptagat', 'Ainabkoi/Olare'] },
    { name: 'Kesses', wards: ['Racecourse', 'Cheptiret/Kipchamo', 'Tulwet/Chuiyat', 'Tarakwa'] },
    { name: 'Moiben', wards: ['Tembelio', 'Sergoit', 'Karuna/Meibeki', 'Moiben', 'Kipsoen'] },
    { name: 'Soy', wards: ['Moi\'s Bridge', 'Kapkenda', 'Ziwa', 'Segero/Barsombe', 'Kipsomba', 'Soy'] },
    { name: 'Turbo', wards: ['Ngenyilel', 'Tapsagoi', 'Kamagut', 'Kiplombe', 'Kapsaos', 'Huruma'] }
  ],
  'Machakos': [
    { name: 'Mavoko (Athi River)', wards: ['Athi River Town/EPZ', 'Syokimau/Mulolongo', 'Katani', 'Kinanie', 'Muthwani'] },
    { name: 'Machakos Town', wards: ['Kalama', 'Mua', 'Mutituni', 'Machakos CBD', 'Mumbuni North', 'Muvuti/Kiima-Kimwe'] },
    { name: 'Kangundo', wards: ['Kangundo North', 'Kangundo Central', 'Kangundo East', 'Kangundo West'] },
    { name: 'Matungulu', wards: ['Tala', 'Matungulu North', 'Matungulu East', 'Matungulu West', 'Kyeleni'] },
    { name: 'Mwala', wards: ['Mwala Town', 'Mbiuni', 'Makaveti', 'Kibauni', 'Masii'] },
    { name: 'Yatta', wards: ['Ndalani', 'Matuu', 'Kithimani', 'Ikombe', 'Katangi'] },
    { name: 'Kathiani', wards: ['Mitaboni', 'Kathiani Central', 'Upper Kaewa', 'Lower Kaewa'] }
  ],
  'Kajiado': [
    { name: 'Kajiado North', wards: ['Olkeri', 'Ongata Rongai', 'Nkaimurunya', 'Oloolua', 'Ngong Town'] },
    { name: 'Kajiado East', wards: ['Kitengela Town', 'Sholinke/Oloosirkon', 'Kenyawa-Poka', 'Imaroro', 'Kaputiei North'] },
    { name: 'Kajiado Central', wards: ['Purko', 'Ildamat', 'Dalalekutuk', 'Matapato North', 'Matapato South'] },
    { name: 'Kajiado West', wards: ['Keekonyokie', 'Iloodokilani', 'Magadi', 'Ewuaso Oonkidong\'i', 'Mosiro'] },
    { name: 'Kajiado South', wards: ['Entonet/Lenkisim', 'Mbirikani/Eselenkei', 'Kuku', 'Rombo', 'Kimana'] }
  ],
  'Murang\'a': [
    { name: 'Kiharu', wards: ['Murang\'a CBD', 'Mbiri', 'Township', 'Murarandia', 'Gaturi', 'Mugoiri'] },
    { name: 'Maragua', wards: ['Kimorori/Wempa', 'Makuyu', 'Kambiti', 'Kamahuha', 'Ichagaki', 'Nginda'] },
    { name: 'Kandara', wards: ['Ng\'araria', 'Muruka', 'Kagundu-ini', 'Gaichanjiru', 'Ithiru'] },
    { name: 'Gatanga', wards: ['Ithanga', 'Kakuzi/Mitubiri', 'Mugumo-ini', 'Gatanga', 'Kihumbu-ini'] },
    { name: 'Kangema', wards: ['Kanyenya-ini', 'Muguru', 'Rwizini'] },
    { name: 'Mathioya', wards: ['Gitugi', 'Kiru', 'Kamacharia'] },
    { name: 'Kigumo', wards: ['Kahumbu', 'Muthithi', 'Kigumo', 'Kinyona'] }
  ],
  'Kirinyaga': [
    { name: 'Kirinyaga Central', wards: ['Mutira', 'Kanyekini', 'Kerugoya CBD', 'Inoi'] },
    { name: 'Mwea', wards: ['Mutithi', 'Kangai', 'Thiba / Mwea Rice', 'Wamumu', 'Nyangati', 'Murinduko'] },
    { name: 'Gichugu', wards: ['Kabare', 'Baragwi', 'Karumandi', 'Ngariama', 'Njukiini'] },
    { name: 'Ndia', wards: ['Mukure', 'Kariti', 'Kiine'] }
  ],
  'Nyeri': [
    { name: 'Nyeri Central', wards: ['Rware/CBD', 'Gatitu/Aguthi', 'Ruring\'u', 'Kamakwa'] },
    { name: 'Tetu', wards: ['Dedan Kimathi', 'Wamagana', 'Aguthi-Gaaki'] },
    { name: 'Kieni East', wards: ['Gakawa', 'Naromoru/Kiamathaga', 'Thegu River', 'Kabaru'] },
    { name: 'Kieni West', wards: ['Mweiga', 'Gatarakwa', 'Endarasha/Rimuruti', 'Mugunda'] },
    { name: 'Mathira East', wards: ['Iriaini', 'Karatina Town', 'Magutu'] },
    { name: 'Mathira West', wards: ['Kirimukuyu', 'Konyu'] },
    { name: 'Othaya', wards: ['Mahiga', 'Iria-Ini', 'Chinga', 'Karima'] },
    { name: 'Mukurweini', wards: ['Mukurwe-ini West', 'Mukurwe-ini Central', 'Rugi', 'Gakindu'] }
  ],
  'Nyandarua': [
    { name: 'Ol Kalou', wards: ['Karau', 'Kanjuiri Range', 'Mirangine', 'Kaimbaga', 'Rurii'] },
    { name: 'Kinangop', wards: ['Engineer', 'Gathara', 'North Kinangop', 'Murungaru', 'Njabini/Kiburu'] },
    { name: 'Kipipiri', wards: ['Wanjohi', 'Kipipiri', 'Geta', 'Githioro'] },
    { name: 'Ol Joro Orok', wards: ['Gathanji', 'Gatimu', 'Weru', 'Charagita'] },
    { name: 'Ndaragwa', wards: ['Leshau Pondo', 'Kiriita', 'Central', 'Shamata'] }
  ],
  'Laikipia': [
    { name: 'Laikipia East', wards: ['Nanyuki Town', 'Thingithu', 'Ngituru', 'Umande'] },
    { name: 'Laikipia West', wards: ['Rumuruti Township', 'Githiga', 'Marmanet', 'Salama', 'Ol-Moran'] },
    { name: 'Laikipia North', wards: ['Sosian', 'Segera', 'Mugogodo West', 'Mugogodo East'] }
  ],
  'Kilifi': [
    { name: 'Kilifi North', wards: ['Tezo', 'Sokoni', 'Kibarani', 'Dabaso', 'Matsangoni', 'Watamu'] },
    { name: 'Kilifi South', wards: ['Junju', 'Mtwapa Town', 'Chonyi', 'Vipingo/Pingilikani'] },
    { name: 'Malindi', wards: ['Jilore', 'Kakuyuni', 'Ganda', 'Malindi Town', 'Shella'] },
    { name: 'Magarini', wards: ['Marafa', 'Magarini', 'Gongoni', 'Adu', 'Garashi'] },
    { name: 'Kaloleni', wards: ['Mariakani', 'Kaloleni', 'Kayafungo', 'Mwanamwinga'] },
    { name: 'Rabai', wards: ['Mwawesa', 'Ruruma', 'Kambe/Ribe', 'Rabai/Kisurutini'] },
    { name: 'Ganze', wards: ['Ganze', 'Bamba', 'Jaribuni', 'Sokoke'] }
  ],
  'Kwale': [
    { name: 'Matuga', wards: ['Tsimba Golini', 'Waa', 'Tiwi', 'Kubo South', 'Mwalukanje'] },
    { name: 'Msambweni', wards: ['Gombato Bongwe', 'Ukunda Town', 'Kinondo', 'Ramisi'] },
    { name: 'Lunga Lunga', wards: ['Pongwe/Kikoneni', 'Dzombo', 'Mwereni', 'Vanga'] },
    { name: 'Kinango', wards: ['Ndavaya', 'Puma', 'Kinango', 'Mackinnon Road', 'Chengoni/Samburu'] }
  ],
  'Lamu': [
    { name: 'Lamu West', wards: ['Shella', 'Mkomani', 'Hindi', 'Mpeketoni', 'Hongwe', 'Witu'] },
    { name: 'Lamu East', wards: ['Faza', 'Kiunga', 'Basuba'] }
  ],
  'Taita-Taveta': [
    { name: 'Voi', wards: ['Mbulia', 'Ngolia', 'Kaloleni', 'Marungu', 'Kasigau', 'Voi CBD'] },
    { name: 'Mwatate', wards: ['Rong\'e', 'Mwatate', 'Bura', 'Chavia', 'Wusi/Kishamba'] },
    { name: 'Wundanyi', wards: ['Wundanyi/MBale', 'Werugha', 'Mgange/Mwanda', 'Kishushe/Werugha'] },
    { name: 'Taveta', wards: ['Chala', 'Mahoo', 'Bomani', 'Mboghoni', 'Mata'] }
  ],
  'Tana River': [
    { name: 'Tana Delta', wards: ['Kipini East', 'Garsen South', 'Kipini West', 'Garsen Central'] },
    { name: 'Tana River', wards: ['Mikinduni', 'Chewani', 'Wayu', 'Hola CBD'] },
    { name: 'Tana North', wards: ['Chewele', 'Hirimani', 'Bangale', 'Madogo'] }
  ],
  'Garissa': [
    { name: 'Garissa Township', wards: ['Waberi', 'Galbet', 'Township', 'Iftin'] },
    { name: 'Balambala', wards: ['Balambala', 'Sankuri', 'Jardet', 'Saka'] },
    { name: 'Dadaab', wards: ['Dertu', 'Dadaab', 'Labasigale', 'Damajale'] },
    { name: 'Fafi', wards: ['Bura East', 'Dekaharja', 'Jarajila', 'Fafi'] },
    { name: 'Ijara', wards: ['Ijara', 'Masalani', 'Sangailu'] },
    { name: 'Lagdera', wards: ['Modogashe', 'Benane', 'Goreale'] }
  ],
  'Wajir': [
    { name: 'Wajir East', wards: ['Wagberi', 'Township', 'Bute', 'Khorof Harar'] },
    { name: 'Wajir West', wards: ['Arbajahan', 'Hadado/Athibohol', 'Ademasajida', 'Ganyure'] },
    { name: 'Wajir North', wards: ['Gurar', 'Bute', 'Korondile', 'Malkagufu'] },
    { name: 'Wajir South', wards: ['Benane', 'Burder', 'Habaswein', 'Lagboghol South'] },
    { name: 'Eldas', wards: ['Eldas', 'Elben', 'Lakoley South'] },
    { name: 'Tarbaj', wards: ['Elben', 'Sarman', 'Tarbaj', 'Wargadud'] }
  ],
  'Mandera': [
    { name: 'Mandera East', wards: ['Arabia', 'Bulls', 'Township', 'Neboi', 'Khalalio'] },
    { name: 'Mandera West', wards: ['Takaba South', 'Takaba North', 'Lagsure', 'Dandu'] },
    { name: 'Mandera North', wards: ['Rhamu', 'Rhamu Dimtu', 'Ashabito', 'Guticha'] },
    { name: 'Mandera South', wards: ['Elwak North', 'Elwak South', 'Shimbir Fatuma'] },
    { name: 'Banissa', wards: ['Banissa', 'Derkhuss', 'Guba', 'Malkamari'] },
    { name: 'Lafey', wards: ['Lafey', 'Warankara', 'Alango Gof'] }
  ],
  'Marsabit': [
    { name: 'Saku', wards: ['Sagante/Jaldesa', 'Karare', 'Marsabit Central'] },
    { name: 'Laisamis', wards: ['Loiyangalani', 'Kargi/South Horr', 'Korr/Ngurunit', 'Laisamis'] },
    { name: 'Moyale', wards: ['Moyale Township', 'Butiye', 'Sololo', 'Heilu/Manyatta'] },
    { name: 'North Horr', wards: ['Dukana', 'North Horr', 'Turbi', 'Maikona'] }
  ],
  'Isiolo': [
    { name: 'Isiolo', wards: ['Wabera', 'Bulla Pesa', 'Burat', 'Ngaremara', 'Oldo/Nyiro'] },
    { name: 'Garbatulla', wards: ['Garbatulla', 'Kinna', 'Sericho'] },
    { name: 'Merti', wards: ['Merti', 'Cherab'] }
  ],
  'Meru': [
    { name: 'Imenti North', wards: ['Municipality', 'Ntima East', 'Ntima West', 'Nyaki North', 'Nyaki West'] },
    { name: 'Imenti South', wards: ['Mitiine', 'Igoji Normal', 'Igoji South', 'Abogeta East', 'Abogeta West', 'Nkuene'] },
    { name: 'Central Imenti', wards: ['Mwanganthia', 'Abothuguchi Central', 'Abothuguchi West', 'Kiagu'] },
    { name: 'Buuri', wards: ['Timau', 'Kisima', 'Ruiri/Rwarera', 'Kiirua/Naari'] },
    { name: 'Tigania East', wards: ['Muthara', 'Karama', 'Kianjai', 'Mikinduri'] },
    { name: 'Tigania West', wards: ['Athwana', 'Akithii', 'Kianjai West', 'Nkomo'] },
    { name: 'Igembe North', wards: ['Antuambui', 'Ntunene', 'Antubetwe Kiongo', 'Naathu'] },
    { name: 'Igembe Central', wards: ['Akirang\'ondu', 'Athiru Ruujine', 'Igembe East', 'Kangeta'] },
    { name: 'Igembe South', wards: ['Maua Town', 'Kiegoi/Antubochiu', 'Athiru Gaiti', 'Akachiu'] }
  ],
  'Tharaka-Nithi': [
    { name: 'Chuka/Igambang\'ombe', wards: ['Mariani', 'Karingani', 'Magumoni', 'Mugwe', 'Igambang\'ombe'] },
    { name: 'Maara', wards: ['Mitheru', 'Muthambi', 'Mwimbi', 'Ganga', 'Chogoria'] },
    { name: 'Tharaka', wards: ['Gatunga', 'Mukothima', 'Nkondi', 'Chiakariga', 'Marimanti'] }
  ],
  'Embu': [
    { name: 'Manyatta', wards: ['Ruguru/Ngandori', 'Kirimari', 'Gaturi South', 'Gaturi North', 'Kiamuringa'] },
    { name: 'Runyenjes', wards: ['Gaturi North', 'Kagaari North', 'Kagaari South', 'Central Ward', 'Kyeni North', 'Kyeni South'] },
    { name: 'Mbeere North', wards: ['Nthawa', 'Mbeti North', 'Evurore'] },
    { name: 'Mbeere South', wards: ['Mwea', 'Makima', 'Mbeti South', 'Mavuria', 'Kiambere'] }
  ],
  'Kitui': [
    { name: 'Kitui Central', wards: ['Miambani', 'Township', 'Kyangwithya West', 'Kyangwithya East', 'Mulango'] },
    { name: 'Kitui West', wards: ['Mutonguni', 'Kauwi', 'Matinyani', 'Kwa Mutonga/Kithumula'] },
    { name: 'Kitui Rural', wards: ['Kisasi', 'Mbitini', 'Kwavonza/Yatta', 'Yatta/Kwavonza'] },
    { name: 'Kitui South', wards: ['Ikutha', 'Mutomo', 'Kanziko', 'Athi', 'Mutha'] },
    { name: 'Kitui East', wards: ['Zombe/Mwitika', 'Nzambani', 'Mutito/Kaliku', 'Chuluni'] },
    { name: 'Mwingi Central', wards: ['Central', 'Kivou', 'Nguni', 'Nuu', 'Mui'] },
    { name: 'Mwingi North', wards: ['Ngomeni', 'Kyuso', 'Mumoni', 'Tseikuru'] },
    { name: 'Mwingi West', wards: ['Kyome/Thaana', 'Nguutani', 'Migwani', 'Kiomo/Kyethani'] }
  ],
  'Makueni': [
    { name: 'Makueni', wards: ['Wote CBD', 'Muvau/Kikuumini', 'Mavindini', 'Kitise/Kithuki', 'Kathonzweni'] },
    { name: 'Kaiti', wards: ['Ukia', 'Kee', 'Kilungu', 'Ilima'] },
    { name: 'Kibwezi East', wards: ['Masongaleni', 'Mtito Andei', 'Thange', 'Ivingoni/Nzambani'] },
    { name: 'Kibwezi West', wards: ['Makindu', 'Nguumo', 'Kikumbulyu North', 'Kikumbulyu South', 'Nguu/Masumba', 'Emali/Sultan Hamud'] },
    { name: 'Kilome', wards: ['Kasikeu', 'Mukaa', 'Kiima Kiu/Kalanzoni'] },
    { name: 'Mbooni', wards: ['Tulimani', 'Mbooni', 'Kithungo/Kitundu', 'Kitise', 'Waia-Kako'] }
  ],
  'Turkana': [
    { name: 'Turkana Central', wards: ['Kerio Delta', 'Kang\'atotha', 'Kalokol', 'Lodwar Township', 'Kanamkemer'] },
    { name: 'Turkana West', wards: ['Kakuma', 'Lopur', 'Letea', 'Songot', 'Kalobeyei', 'Lokichoggio'] },
    { name: 'Turkana South', wards: ['Kaputir', 'Katilu', 'Lobokat', 'Kalapata', 'Lokichar'] },
    { name: 'Turkana North', wards: ['Kaeris', 'Lake Zone', 'Lapur', 'Kaaleng/Kaikor', 'Kibish'] },
    { name: 'Turkana East', wards: ['Kapedo/Napeitom', 'Katilia', 'Lokori/Kochodin'] },
    { name: 'Loima', wards: ['Kotaruk/Lobei', 'Turkwel', 'Loima', 'Lokiriama/Lorenhippool'] }
  ],
  'West Pokot': [
    { name: 'Kapenguria', wards: ['Riwo', 'Kapenguria CBD', 'Endugh', 'Sook', 'Siyoi'] },
    { name: 'Pokot South', wards: ['Chepareria', 'Batei', 'Lelan', 'Tapach'] },
    { name: 'Sigor', wards: ['Weiwei', 'Masol', 'Lomut', 'Sekerr'] },
    { name: 'Kacheliba', wards: ['Suam', 'Kodich', 'Kapsei', 'Kapchok', 'Alale'] }
  ],
  'Samburu': [
    { name: 'Samburu West', wards: ['Lodokejek', 'Suguta Marmar', 'Maralal CBD', 'Loosuk', 'Poro'] },
    { name: 'Samburu North', wards: ['El-Barta', 'Nachola', 'Ndoto', 'Nyiro', 'Angata Nanyokie'] },
    { name: 'Samburu East', wards: ['Waso', 'Wamba West', 'Wamba East', 'Wamba North'] }
  ],
  'Trans-Nzoia': [
    { name: 'Saboti', wards: ['Kinyoro', 'Matisi', 'Tuwani', 'Saboti', 'Machewa'] },
    { name: 'Kiminini', wards: ['Kiminini', 'Waitaluk', 'Sirende', 'Hospital', 'Sikhendu', 'Nabiswa'] },
    { name: 'Endebess', wards: ['Endebess', 'Matumbei', 'Chepchoina'] },
    { name: 'Cherangany', wards: ['Sinyerere', 'Makutano', 'Kapsara', 'Cherangany/Suwerwa', 'Motosiet'] },
    { name: 'Kwanza', wards: ['K Kapomboi', 'Keiyo', 'Kwanza', 'Bidii'] }
  ],
  'Elgeyo-Marakwet': [
    { name: 'Keiyo North', wards: ['Emsoo', 'Kamariny', 'Lelan', 'Tambach'] },
    { name: 'Keiyo South', wards: ['Kaptarakwa', 'Chepkorio', 'Soy North', 'Soy South', 'Kabiemit', 'Metkei'] },
    { name: 'Marakwet East', wards: ['Kapyego', 'Sambirir', 'Endo', 'Embobut / Embobut West'] },
    { name: 'Marakwet West', wards: ['Lelan', 'Sengwer', 'Cherang\'any/Chebororwa', 'Moiben/Kuserwo', 'Kapsowar'] }
  ],
  'Nandi': [
    { name: 'Emgwen', wards: ['Chepkumia', 'Kapkangani', 'Kapsabet CBD', 'Kilibwoni'] },
    { name: 'Chesumei', wards: ['Chepterwai', 'Kipkaren', 'Kesses', 'Lelmokwo/Ngechek', 'Kosirai'] },
    { name: 'Aldai', wards: ['Kabwareng', 'Terik', 'Kemeloi-Maraba', 'Kobujoi', 'Kaptumo-Kaboi'] },
    { name: 'Tinderet', wards: ['Songhor/Tachasis', 'Tinderet', 'Chemelil/Chemase', 'Kapsimotwo'] },
    { name: 'Nandi Hills', wards: ['Nandi Hills CBD', 'Chepkunyuk', 'Ol\'lessos', 'Kapchorua'] },
    { name: 'Mosop', wards: ['Chepterwai', 'Kipkaren', 'Kabianga', 'Sang\'alo'] }
  ],
  'Baringo': [
    { name: 'Baringo Central', wards: ['Kabarnet CBD', 'Sacho', 'Tenges', 'Ewalel/Chapchap', 'Kapropita'] },
    { name: 'Eldama Ravine', wards: ['Lembus', 'Lembus Kwen', 'Ravine CBD', 'Lembus Perkerra', 'Mumberes/Majimoto'] },
    { name: 'Baringo South', wards: ['Marigat', 'Ilchamus', 'Mochongoi', 'Mukutani'] },
    { name: 'Baringo North', wards: ['Barwessa', 'Kabartonjo', 'Saimo/Kipsaraman', 'Saimo/Soi', 'Bartabwa'] },
    { name: 'Mogotio', wards: ['Mogotio Town', 'Emining', 'Kisanana'] },
    { name: 'Tiaty', wards: ['Tirioko', 'Kolowa', 'Ribkwo', 'Silale', 'Tangulbei/Korosi', 'Churo/Amai'] }
  ],
  'Narok': [
    { name: 'Narok North', wards: ['Olpusimoru', 'Olokurto', 'Narok Town CBD', 'Nkareta', 'Olorropil'] },
    { name: 'Narok South', wards: ['Majimoto/Naroosura', 'Ololulung\'a', 'Melelo', 'Loita', 'Sogoo'] },
    { name: 'Narok East', wards: ['Mosiro', 'Ildamat', 'Keekonyokie', 'Suswa'] },
    { name: 'Narok West', wards: ['Mara', 'Siana', 'Naikarra', 'Nalepo'] },
    { name: 'Trans Mara East', wards: ['Ilkerin', 'Ololmasani', 'Mogondo', 'Kipise'] },
    { name: 'Trans Mara West', wards: ['Kilgoris Central', 'Keyian', 'Angata Barikoi', 'Shankoe', 'Kimintet'] }
  ],
  'Kericho': [
    { name: 'Ainamoi', wards: ['Kapsoit', 'Ainamoi', 'Kipchebor', 'Kipchimchim', 'Kapsaos'] },
    { name: 'Belgut', wards: ['Waldai', 'Kabianga', 'Cheptororiet/Seretut', 'Chaik', 'Kapsuser'] },
    { name: 'Kipkelion East', wards: ['Londiani', 'Kedowa/Kimugul', 'Chepseon', 'Tendeno/Sorghum'] },
    { name: 'Kipkelion West', wards: ['Kunyak', 'Kipkelion Town', 'Kamasian', 'Chilchila'] },
    { name: 'Bureti', wards: ['Kissi/Tebesonik', 'Cheboin', 'Cheplanget', 'Kapkatet', 'Litein CBD'] }
  ],
  'Bomet': [
    { name: 'Bomet Central', wards: ['Silibwet Township', 'Ndaraweta', 'Singorwet', 'Chesoen', 'Mutarakwa'] },
    { name: 'Bomet East', wards: ['Longisa', 'Kembu', 'Chemaner', 'Merigi', 'Kipreres'] },
    { name: 'Chepalungu', wards: ['Sigor', 'Kong\'asis', 'Chebunyo', 'Nyangores', 'Siongiroi'] },
    { name: 'Konoin', wards: ['Cheptalal', 'Kimulot', 'Mogogosiek', 'Boito', 'Embomos'] },
    { name: 'Sotik', wards: ['Ndanai/Abosi', 'Chemagel/Sotik', 'Kipsonoi', 'Kapletundo', 'Rongena/Manaret'] }
  ],
  'Kakamega': [
    { name: 'Lurambi', wards: ['Butsotso East', 'Butsotso South', 'Butsotso Central', 'Sheywe/Kakamega CBD', 'Mahiakalo', 'Shirere'] },
    { name: 'Malava', wards: ['West Kabras', 'Chemuche', 'East Kabras', 'South Kabras', 'Manda-Shivanga', 'Shirugu-Mugai'] },
    { name: 'Lugari', wards: ['Mautuma', 'Lugari', 'Lumakanda', 'Chekalini', 'Chevaywa', 'Lwandeti'] },
    { name: 'Likuyani', wards: ['Likuyani', 'Sango', 'Kongoni', 'Nzoia', 'Sinoko'] },
    { name: 'Mumias West', wards: ['Mumias Central', 'Mumias North', 'Etenje', 'Musanda'] },
    { name: 'Mumias East', wards: ['Lusheya/Lubinu', 'Malandinya', 'Isongo/Makunga'] },
    { name: 'Matungu', wards: ['Koyonzo', 'Kholera', 'Khalaba', 'Mayoni', 'Namamali'] },
    { name: 'Butere', wards: ['Marama West', 'Marama Central', 'Marenyo-Shianda', 'Marama North', 'Marama South'] },
    { name: 'Khwisero', wards: ['Kisa North', 'Kisa East', 'Kisa West', 'Kisa Central'] },
    { name: 'Shinyalu', wards: ['Isukha North', 'Isukha Central', 'Isukha South', 'Isukha East', 'Isukha West'] },
    { name: 'Ikolomani', wards: ['Idakho South', 'Idakho East', 'Idakho North', 'Idakho Central'] }
  ],
  'Vihiga': [
    { name: 'Vihiga', wards: ['Lugaga-Wamuluma', 'South Maragoli', 'Central Maragoli', 'Mungoma'] },
    { name: 'Sabatia', wards: ['Lyaduywa/Izava', 'West Sabatia', 'Chavakali', 'North Maragoli', 'Wodanga'] },
    { name: 'Hamisi', wards: ['Shiru', 'Gisambai', 'Shamakhokho', 'Banja', 'Muhudu', 'Tambua'] },
    { name: 'Luanda', wards: ['Luanda Township', 'Wemilabi', 'Mwibona', 'Luanda South', 'Emabungo'] },
    { name: 'Emuhaya', wards: ['North East Bunyore', 'Central Bunyore', 'West Bunyore'] }
  ],
  'Bungoma': [
    { name: 'Kanduyi', wards: ['Bukembe West', 'Bukembe East', 'Township/Bungoma CBD', 'Marakaru/Tuuti', 'Khalaba', 'Musikoma'] },
    { name: 'Tongaren', wards: ['Mbatian', 'Tongaren', 'Soysambu/Mitua', 'Naitiri/Kabuyefwe', 'Milima', 'Ndalu'] },
    { name: 'Webuye East', wards: ['Mihuu', 'Ndivisi', 'Maraka'] },
    { name: 'Webuye West', wards: ['Sitikho', 'Matulo', 'Bokoli', 'Chetambe'] },
    { name: 'Mt. Elgon', wards: ['Cheptais', 'Chesikaki', 'Kapekwa', 'Elgon', 'Kapkateny', 'Kapsokwony'] },
    { name: 'Sirisia', wards: ['Namwela', 'Malakisi/South Kulisiru', 'Lwandanyi'] },
    { name: 'Kabuchai', wards: ['Kabuchai/Chwele', 'West Nalondo', 'Bwake/Luuya', 'Mukwe'] },
    { name: 'Bumula', wards: ['South Bukusu', 'Bumula', 'Khasoko', 'Kabula', 'Kimaeti', 'West Bukusu'] },
    { name: 'Kimilili', wards: ['Kibingei', 'Kimilili CBD', 'Maeni', 'Kamtini'] }
  ],
  'Busia': [
    { name: 'Matayos', wards: ['Bukhayo West', 'Mayenje', 'Matayos South', 'Busia Township/CBD', 'Burumba'] },
    { name: 'Nambale', wards: ['Nambale Township', 'Bukhayo North/Waltsi', 'Bukhayo East', 'Bukhayo Central'] },
    { name: 'Teso North', wards: ['Malaba Central', 'Malaba North', 'Ang\'urai South', 'Ang\'urai North', 'Ang\'urai East'] },
    { name: 'Teso South', wards: ['Ang\'orom', 'Chakol South', 'Chakol North', 'Amukura West', 'Amukura East', 'Amukura Central'] },
    { name: 'Funyula', wards: ['Namboboto Nambabu', 'Nangina', 'Ageng\'a Nanguba', 'Bwiri'] },
    { name: 'Budalangi', wards: ['Karungu/Bunyala West', 'Bunyala Central', 'Bunyala North', 'Bunyala South'] },
    { name: 'Butula', wards: ['Marachi West', 'Marachi Central', 'Marachi East', 'Marachi North'] }
  ],
  'Siaya': [
    { name: 'Alego Usonga', wards: ['Usonga', 'West Alego', 'Central Alego', 'Siaya Township/CBD', 'North Alego', 'South East Alego'] },
    { name: 'Bondo', wards: ['West Yimbo', 'Central Sakwa', 'South Sakwa', 'Yimbo East', 'West Sakwa', 'North Sakwa'] },
    { name: 'Gem', wards: ['North Gem', 'West Gem', 'Central Gem', 'Yala Township', 'East Gem', 'South Gem'] },
    { name: 'Ugenya', wards: ['West Ugenya', 'Ukuriri', 'North Ugenya', 'East Ugenya'] },
    { name: 'Ugunja', wards: ['Sidindi', 'Sigomere', 'Ugunja CBD'] },
    { name: 'Rarieda', wards: ['East Asembo', 'West Asembo', 'North Uyoma', 'South Uyoma', 'West Uyoma'] }
  ],
  'Homa Bay': [
    { name: 'Homa Bay Town', wards: ['Homa Bay Central/CBD', 'Homa Bay Arujo', 'Homa Bay West', 'Homa Bay East'] },
    { name: 'Kabondo Kasipul', wards: ['Kabondo East', 'Kabondo West', 'Kokwanyo/Kakelo', 'Kojwach'] },
    { name: 'Kasipul', wards: ['West Kasipul', 'South Kasipul', 'Central Kasipul', 'East Kamagak', 'Oyugis CBD'] },
    { name: 'Mbita', wards: ['Mfangano Island', 'Rusinga Island', 'Kasgunga', 'Gembe', 'Lambwe'] },
    { name: 'Ndhiwa', wards: ['Kwabwai', 'Kaniamwa Kologi', 'Kaniamwa Kisa', 'Riana', 'South Kabuoch', 'North Kabuoch'] },
    { name: 'Rangwe', wards: ['West Gem', 'East Gem', 'Kagan', 'Kochia'] },
    { name: 'Suba North', wards: ['Gwassi North', 'Gwassi South', 'Kaksingri West', 'Ruma'] },
    { name: 'Suba South', wards: ['Kaksingri East', 'Ruma/Kaksingri'] }
  ],
  'Migori': [
    { name: 'Suna East', wards: ['God Jope', 'Suna Central/CBD', 'Kakosia', 'Kwa'] },
    { name: 'Suna West', wards: ['Wazumba', 'Oruba Ragana', 'Wasimbete', 'Wasweta II'] },
    { name: 'Uriri', wards: ['West Kanyamkago', 'North Kanyamkago', 'Central Kanyamkago', 'South Kanyamkago', 'East Kanyamkago'] },
    { name: 'Nyatike', wards: ['Kachieng', 'Kanyasa', 'North Kadem', 'Macalder/Kujer', 'Kaler', 'Got Othidha'] },
    { name: 'Rongo', wards: ['North Kamagambo', 'Central Kamagambo', 'East Kamagambo', 'South Kamagambo'] },
    { name: 'Awendo', wards: ['North Sakwa', 'South Sakwa', 'West Sakwa', 'Central Sakwa'] },
    { name: 'Kuria East', wards: ['Gokeharaka/Getambwega', 'Ntimaru West', 'Ntimaru East', 'Nyabasi East', 'Nyabasi West'] },
    { name: 'Kuria West', wards: ['Bukira East', 'Bukira Central/Kehancha', 'Isibania Border', 'M tagaro', 'Makerero'] }
  ],
  'Kisii': [
    { name: 'Nyaribari Chache', wards: ['Kisii Central/CBD', 'Kiogoro', 'Birongo', 'Kiamokama', 'Ibeno'] },
    { name: 'Kitutu Chache South', wards: ['Bogusero', 'Bogeka', 'Nyakoe', 'Kitutu Central', 'Nyatieko'] },
    { name: 'Kitutu Chache North', wards: ['Monienda', 'Sensi', 'Mwamonari', 'Marani'] },
    { name: 'Nyaribari Masaba', wards: ['Ichuni', 'Nyamasibi', 'Masimba', 'Gesusu', 'Kiamokama'] },
    { name: 'Bobasi', wards: ['Masige West', 'Masige East', 'Bassi Central', 'Nyacheki', 'Bassi Bogetaorio', 'Sameta'] },
    { name: 'Bomachoge Borabu', wards: ['Bomorenda', 'Bassi Ogembo', 'Boochi Borabu', 'Bokimonge'] },
    { name: 'Bomachoge Chache', wards: ['Majoge', 'Boochi Tendere', 'Bosoti/Sengera'] },
    { name: 'South Mugirango', wards: ['Bogetenga', 'Borabu / Chitago', 'Motcho', 'Getenga', 'Tabaka'] },
    { name: 'Bonchari', wards: ['Bomariba', 'Bokeira', 'Riana', 'Bogiakumu'] }
  ],
  'Nyamira': [
    { name: 'Nyamira South', wards: ['Township/Nyamira CBD', 'Bonyamatuta', 'Bogichora'] },
    { name: 'Nyamira North', wards: ['Itibo', 'Bomwagamo', 'Bokeira', 'Magwagwa', 'Ekerenyo'] },
    { name: 'Borabu', wards: ['Mekenene', 'Kiabonyoru', 'Nyashionde', 'Esise'] },
    { name: 'Manga', wards: ['Manga', 'Magombo', 'Kemera'] },
    { name: 'Masaba North', wards: ['Rigoma', 'Gachuba', 'Gesima'] }
  ]
};

export const KENYA_COUNTY_HIERARCHY = Object.keys(RAW_COUNTY_DATA).map(county => ({
  name: county,
  subCounties: RAW_COUNTY_DATA[county]
}));

export function getSubCountiesForCounty(countyName: string): string[] {
  const norm = (countyName || 'Kiambu').trim();
  const found = KENYA_COUNTY_HIERARCHY.find(
    c => c.name.toLowerCase() === norm.toLowerCase()
  );
  if (found && found.subCounties) {
    return found.subCounties.map(sc => sc.name);
  }
  return ['Ruiru', 'Juja', 'Thika Town', 'Kiambu Central'];
}

export function getWardsForSubCounty(countyName: string, subCountyName: string): string[] {
  const normCounty = (countyName || 'Kiambu').trim();
  const normSubCounty = (subCountyName || '').trim();

  const countyObj = KENYA_COUNTY_HIERARCHY.find(
    c => c.name.toLowerCase() === normCounty.toLowerCase()
  );

  if (countyObj) {
    const sc = countyObj.subCounties.find(
      s => s.name.toLowerCase() === normSubCounty.toLowerCase()
    );
    if (sc && sc.wards && sc.wards.length > 0) {
      return sc.wards;
    }
    if (countyObj.subCounties[0]?.wards) {
      return countyObj.subCounties[0].wards;
    }
  }

  return ['Central / Township Ward', 'Market Area Ward', 'Industrial Zone Ward'];
}

export function getAreasForWard(countyName: string, subCountyName: string, wardName: string): string[] {
  const ward = (wardName || 'Central').trim();
  return [
    `${ward} Central / Town Centre`,
    `${ward} Industrial & Commercial Park`,
    `${ward} Residential Estate Gate A`,
    `${ward} Market & Transport Hub`,
    `${ward} Hospital & School Zone`
  ];
}

import { getCountyCoords } from './countyCoordinates';

export function getHierarchyCoords(
  countyName: string,
  subCountyName: string,
  wardName: string,
  areaName: string
): { lat: number; lng: number } {
  const base = getCountyCoords(countyName);
  const hash = ((subCountyName || '') + (wardName || '') + (areaName || '')).length;
  const latOffset = ((hash % 10) - 5) * 0.003;
  const lngOffset = (((hash * 3) % 10) - 5) * 0.003;
  return { lat: base.lat + latOffset, lng: base.lng + lngOffset };
}
