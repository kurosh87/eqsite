-- Seed comprehensive haplogroup data
-- Run with: psql $DATABASE_URL -f scripts/seed-haplogroups.sql

-- Create the haplogroups table if it doesn't exist
CREATE TABLE IF NOT EXISTS haplogroups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  full_name TEXT,
  short_description TEXT,
  description TEXT,
  origin_region TEXT,
  estimated_age TEXT,
  peak_frequency_regions JSONB,
  migration_history TEXT,
  notable_figures JSONB,
  related_haplogroups JSONB,
  associated_ethnicities JSONB,
  scientific_details JSONB,
  display_color TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ
);

-- Clear existing data
TRUNCATE TABLE haplogroups;

-- ============================================
-- Y-DNA (PATERNAL) HAPLOGROUPS
-- ============================================

INSERT INTO haplogroups (name, type, full_name, short_description, description, origin_region, estimated_age, peak_frequency_regions, migration_history, notable_figures, related_haplogroups, associated_ethnicities, scientific_details, display_color) VALUES

-- R1b - Most common in Western Europe
('R1b', 'paternal', 'R1b (R-M343)',
'The most common Y-DNA haplogroup in Western Europe, particularly dominant among Celtic and Germanic populations.',
'R1b is the most frequently occurring Y-chromosome haplogroup in Western Europe, found in over 50% of men in countries like Ireland, Scotland, Wales, Spain, and France. It is associated with the Indo-European migrations during the Bronze Age and is believed to have spread with the Bell Beaker culture. The haplogroup reached Europe approximately 4,500-5,000 years ago from the Pontic Steppe region. R1b carriers are thought to have introduced Proto-Celtic and Proto-Italic languages to Western Europe.',
'Pontic-Caspian Steppe',
'18,000-22,000 years ago',
'[{"region": "Ireland", "percentage": 85, "population": "Irish"}, {"region": "Wales", "percentage": 83, "population": "Welsh"}, {"region": "Scotland", "percentage": 73, "population": "Scottish"}, {"region": "Basque Country", "percentage": 88, "population": "Basque"}, {"region": "Spain", "percentage": 65, "population": "Spanish"}]',
'R1b originated in Western Asia around 22,000 years ago. During the Last Glacial Maximum, its carriers survived in refugia in the Near East. Around 5,000 years ago, a massive expansion occurred from the Pontic Steppe, spreading westward across Europe with the Yamnaya culture. This migration replaced much of the existing male lineages in Western Europe. The haplogroup became dominant in Atlantic Europe by 2500 BCE.',
'[{"name": "Niall of the Nine Hostages", "description": "Legendary Irish High King, ancestor to millions", "verified": true}, {"name": "Tutankhamun", "description": "Egyptian Pharaoh (disputed, R1b1a2)", "verified": false}]',
'[{"name": "R1", "relationship": "parent"}, {"name": "R1b1a", "relationship": "child"}, {"name": "R1b1b", "relationship": "child"}, {"name": "R1a", "relationship": "sibling"}]',
'["Irish", "Scottish", "Welsh", "Basque", "Spanish", "French", "English", "German", "Italian"]',
'{"snps": ["M343", "L11", "P312", "U106"], "mutations": ["M343"], "subclade_count": 250, "discovery_year": 2002}',
'#3B82F6'),

-- R1a - Eastern European/South Asian
('R1a', 'paternal', 'R1a (R-M420)',
'Common in Eastern Europe, Central Asia, and South Asia. Associated with Indo-European expansions.',
'R1a is one of the most widespread Y-DNA haplogroups, with high frequencies in Eastern Europe (particularly Poland, Russia, and Ukraine), Central Asia, and South Asia (especially among Brahmins in India). It is strongly associated with the Indo-Aryan and Balto-Slavic migrations. Two major branches exist: R1a-Z282 (European) and R1a-Z93 (Asian). The haplogroup is linked to the spread of Indo-European languages eastward and southward from the Eurasian Steppe.',
'Pontic-Caspian Steppe',
'18,000-22,000 years ago',
'[{"region": "Poland", "percentage": 58, "population": "Polish"}, {"region": "Russia", "percentage": 46, "population": "Russian"}, {"region": "Ukraine", "percentage": 44, "population": "Ukrainian"}, {"region": "Northern India", "percentage": 35, "population": "Brahmin"}, {"region": "Kyrgyzstan", "percentage": 63, "population": "Kyrgyz"}]',
'R1a emerged in the Eurasian Steppe approximately 22,000 years ago. Around 5,000-4,000 years ago, carriers of R1a-Z93 migrated southward into South Asia with the Indo-Aryan migration, while R1a-Z282 spread throughout Eastern Europe with the Corded Ware culture. The haplogroup is associated with the spread of the domesticated horse and wheeled vehicles.',
'[{"name": "Genghis Khan''s rivals", "description": "Many Central Asian rulers carried R1a", "verified": true}]',
'[{"name": "R1", "relationship": "parent"}, {"name": "R1a1a", "relationship": "child"}, {"name": "R1b", "relationship": "sibling"}]',
'["Polish", "Russian", "Ukrainian", "Czech", "Slovak", "Indian Brahmin", "Pashtun", "Tajik", "Kyrgyz"]',
'{"snps": ["M420", "M17", "Z282", "Z93"], "mutations": ["M420"], "subclade_count": 180, "discovery_year": 2000}',
'#EF4444'),

-- E1b1a - Sub-Saharan African
('E1b1a', 'paternal', 'E1b1a (E-V38)',
'The most common Y-DNA haplogroup in Sub-Saharan Africa, spread with the Bantu expansion.',
'E1b1a is the predominant Y-DNA haplogroup across Sub-Saharan Africa, particularly in West and Central Africa. It is strongly associated with the Bantu expansion, which began around 3,000-5,000 years ago from the Nigeria/Cameroon border region. This migration spread Bantu languages, iron-working technology, and agriculture across most of sub-Saharan Africa. E1b1a is found in over 60% of African American men due to the transatlantic slave trade.',
'West-Central Africa (Nigeria/Cameroon)',
'20,000-30,000 years ago',
'[{"region": "Nigeria", "percentage": 68, "population": "Yoruba"}, {"region": "Cameroon", "percentage": 75, "population": "Bantu speakers"}, {"region": "South Africa", "percentage": 55, "population": "Zulu"}, {"region": "Kenya", "percentage": 45, "population": "Kikuyu"}, {"region": "African Americans", "percentage": 62, "population": "US Black population"}]',
'E1b1a originated in Central Africa and became associated with the Bantu expansion starting around 3000 BCE. Bantu-speaking farmers migrated from their homeland in West-Central Africa, spreading southward and eastward across the continent over the next 3,000 years. They brought iron tools, new crops like yams and bananas, and displaced or absorbed earlier hunter-gatherer populations.',
'[{"name": "Nelson Mandela", "description": "South African anti-apartheid revolutionary", "verified": true}, {"name": "Desmond Tutu", "description": "South African Anglican bishop", "verified": true}]',
'[{"name": "E1b1", "relationship": "parent"}, {"name": "E1b1a1", "relationship": "child"}, {"name": "E1b1b", "relationship": "sibling"}]',
'["Yoruba", "Igbo", "Hausa", "Zulu", "Kikuyu", "Shona", "Akan", "African American", "Afro-Brazilian"]',
'{"snps": ["V38", "M2", "U175"], "mutations": ["V38", "M2"], "subclade_count": 120, "discovery_year": 2004}',
'#F97316'),

-- E1b1b - North/East African & Mediterranean
('E1b1b', 'paternal', 'E1b1b (E-M215)',
'Common in North Africa, East Africa, and the Mediterranean. Ancient origins in the Horn of Africa.',
'E1b1b is one of the most geographically widespread haplogroups, found at high frequencies in North Africa, the Horn of Africa, and the Mediterranean region. It originated in East Africa around 25,000-30,000 years ago and spread northward into North Africa and the Near East during the Neolithic. Different subclades show distinct geographic distributions: E-M78 is common in the Balkans and Italy, E-M81 dominates among Berbers in North Africa, and E-V12 is prevalent in the Horn of Africa.',
'Horn of Africa',
'25,000-30,000 years ago',
'[{"region": "Somalia", "percentage": 78, "population": "Somali"}, {"region": "Ethiopia", "percentage": 65, "population": "Oromo"}, {"region": "Morocco", "percentage": 65, "population": "Berber"}, {"region": "Libya", "percentage": 45, "population": "Libyan"}, {"region": "Greece", "percentage": 21, "population": "Greek"}]',
'E1b1b originated in the Horn of Africa and expanded northward through the Sahara when it was greener (African Humid Period). Around 10,000-8,000 years ago, carriers spread into North Africa with pastoralist cultures. The haplogroup later spread to the Mediterranean with Neolithic farmers and continued to spread with Phoenician and Arab expansions.',
'[{"name": "Albert Einstein", "description": "Theoretical physicist (E1b1b1b2)", "verified": true}, {"name": "Napoleon Bonaparte", "description": "French emperor (E1b1b1b2a)", "verified": true}]',
'[{"name": "E1b1", "relationship": "parent"}, {"name": "E1b1b1", "relationship": "child"}, {"name": "E1b1a", "relationship": "sibling"}]',
'["Somali", "Ethiopian", "Berber", "Egyptian", "Libyan", "Greek", "Albanian", "Italian", "Jewish Sephardic"]',
'{"snps": ["M215", "M35", "M78", "M81"], "mutations": ["M215"], "subclade_count": 95, "discovery_year": 2004}',
'#A855F7'),

-- I1 - Nordic/Germanic
('I1', 'paternal', 'I1 (I-M253)',
'The signature haplogroup of Scandinavia and Germanic peoples, associated with Viking heritage.',
'I1 is the most common Y-DNA haplogroup in Scandinavia and is strongly associated with Germanic and Norse populations. It originated in Northern Europe after the Last Glacial Maximum and expanded significantly during the Neolithic and Bronze Ages. I1 is particularly associated with the Viking Age migrations (8th-11th centuries CE), spreading from Scandinavia to Britain, Iceland, Normandy, and even as far as Russia and Sicily. It remains dominant in Sweden, Norway, and Denmark.',
'Northern Europe (Scandinavia)',
'4,000-5,000 years ago (post-glacial expansion)',
'[{"region": "Sweden", "percentage": 42, "population": "Swedish"}, {"region": "Norway", "percentage": 40, "population": "Norwegian"}, {"region": "Denmark", "percentage": 35, "population": "Danish"}, {"region": "Iceland", "percentage": 38, "population": "Icelandic"}, {"region": "Finland", "percentage": 28, "population": "Finnish"}]',
'I1 emerged in Scandinavia from the older haplogroup I, which was present in Europe before the Neolithic. It expanded with the Nordic Bronze Age culture and later with the Migration Period Germanic tribes. The Viking Age (793-1066 CE) saw I1 spread across the North Atlantic, British Isles, and into continental Europe. Norman conquests brought I1 to Southern Italy and Sicily.',
'[{"name": "Birger Jarl", "description": "Founder of Stockholm, Swedish ruler", "verified": true}, {"name": "Rollo of Normandy", "description": "Viking founder of Normandy lineage", "verified": false}]',
'[{"name": "I", "relationship": "parent"}, {"name": "I1a", "relationship": "child"}, {"name": "I2", "relationship": "sibling"}]',
'["Swedish", "Norwegian", "Danish", "Icelandic", "Finnish", "German", "English", "Dutch"]',
'{"snps": ["M253", "DF29", "Z63"], "mutations": ["M253"], "subclade_count": 85, "discovery_year": 2000}',
'#22C55E'),

-- I2 - Balkan/Sardinian
('I2', 'paternal', 'I2 (I-M438)',
'Ancient European lineage prevalent in the Balkans and Sardinia, predating Indo-European migrations.',
'I2 represents one of the oldest surviving paternal lineages in Europe, tracing back to Paleolithic hunter-gatherers. It has two main branches: I2a (common in the Balkans and Eastern Europe) and I2b (found in Western Europe). I2a2 (Dinaric) is particularly prevalent among South Slavs and may have survived in refugia in the Balkans during the Last Glacial Maximum. Sardinia has exceptionally high frequencies of I2a1, representing an ancient Mediterranean population.',
'Europe (Balkans/Mediterranean)',
'20,000-25,000 years ago',
'[{"region": "Bosnia", "percentage": 55, "population": "Bosnian"}, {"region": "Croatia", "percentage": 45, "population": "Croatian"}, {"region": "Serbia", "percentage": 42, "population": "Serbian"}, {"region": "Sardinia", "percentage": 40, "population": "Sardinian"}, {"region": "Ukraine", "percentage": 20, "population": "Ukrainian"}]',
'I2 emerged in Europe during the Upper Paleolithic and was likely one of the dominant haplogroups among European hunter-gatherers. It survived the Last Glacial Maximum in southern refugia. While I2 was largely replaced by incoming farmers and later by Indo-European speakers, it remained significant in certain regions. The Balkans served as a refugium where I2a2 thrived, later spreading with Slavic migrations.',
'[{"name": "Ötzi the Iceman", "description": "5,300-year-old mummy from the Alps", "verified": true}]',
'[{"name": "I", "relationship": "parent"}, {"name": "I2a", "relationship": "child"}, {"name": "I2b", "relationship": "child"}, {"name": "I1", "relationship": "sibling"}]',
'["Serbian", "Croatian", "Bosnian", "Sardinian", "Ukrainian", "Moldovan", "German"]',
'{"snps": ["M438", "M223", "L69"], "mutations": ["M438"], "subclade_count": 65, "discovery_year": 2002}',
'#10B981'),

-- J1 - Semitic/Arabian
('J1', 'paternal', 'J1 (J-M267)',
'Associated with Semitic peoples, dominant in the Arabian Peninsula and among Arab and Jewish populations.',
'J1 is the signature haplogroup of Semitic-speaking peoples and is found at its highest frequencies in the Arabian Peninsula, the Levant, and among Jewish and Arab populations worldwide. It originated in the Near East and spread with the expansion of Semitic languages and later with Arab conquests (7th-8th centuries CE). J1 is particularly associated with the patrilineal descendants of the Arabian Peninsula, including the lineage of the Prophet Muhammad.',
'Near East (Fertile Crescent)',
'20,000-30,000 years ago',
'[{"region": "Yemen", "percentage": 72, "population": "Yemeni"}, {"region": "Saudi Arabia", "percentage": 58, "population": "Saudi"}, {"region": "United Arab Emirates", "percentage": 45, "population": "Emirati"}, {"region": "Jordan", "percentage": 38, "population": "Jordanian"}, {"region": "Ashkenazi Jews", "percentage": 15, "population": "Jewish"}]',
'J1 originated in the Fertile Crescent and initially spread with Neolithic farmers. A major expansion occurred with the Arab conquests of the 7th-8th centuries CE, spreading J1 from the Arabian Peninsula across the Middle East, North Africa, and into Spain. The haplogroup is strongly associated with the Cohen Modal Haplotype, found among Jewish priests (Cohanim).',
'[{"name": "Prophet Muhammad descendants", "description": "Many Sayyids carry J1", "verified": true}]',
'[{"name": "J", "relationship": "parent"}, {"name": "J1a", "relationship": "child"}, {"name": "J2", "relationship": "sibling"}]',
'["Arab", "Jewish", "Ethiopian", "Sudanese", "Egyptian", "Iraqi", "Syrian", "Lebanese"]',
'{"snps": ["M267", "P58", "L136"], "mutations": ["M267"], "subclade_count": 55, "discovery_year": 2000}',
'#F59E0B'),

-- J2 - Mediterranean/Anatolian
('J2', 'paternal', 'J2 (J-M172)',
'Common in the Mediterranean, Anatolia, and South Asia. Spread with Neolithic farmers and ancient civilizations.',
'J2 is widespread around the Mediterranean, the Caucasus, and South Asia. It is associated with the spread of agriculture from the Fertile Crescent during the Neolithic Revolution. Different subclades show distinct patterns: J2a is common in the Mediterranean, Caucasus, and South Asia, while J2b is found more in the Balkans and Italy. J2 is linked to many ancient civilizations including the Phoenicians, Greeks, and Etruscans.',
'Near East (Fertile Crescent/Anatolia)',
'25,000-30,000 years ago',
'[{"region": "Lebanon", "percentage": 30, "population": "Lebanese"}, {"region": "Turkey", "percentage": 24, "population": "Turkish"}, {"region": "Greece", "percentage": 23, "population": "Greek"}, {"region": "Italy", "percentage": 20, "population": "Italian"}, {"region": "Georgia", "percentage": 28, "population": "Georgian"}]',
'J2 originated in the Fertile Crescent and spread westward with the Neolithic expansion into Europe. It was carried by Anatolian farmers who colonized Europe around 8,000-6,000 years ago. Later, J2 spread further with Bronze Age civilizations, Phoenician traders, Greek colonizers, and Roman expansion. The haplogroup maintains high frequencies around the Mediterranean basin.',
'[{"name": "Phoenician traders", "description": "Ancient Mediterranean traders spread J2", "verified": true}]',
'[{"name": "J", "relationship": "parent"}, {"name": "J2a", "relationship": "child"}, {"name": "J2b", "relationship": "child"}, {"name": "J1", "relationship": "sibling"}]',
'["Greek", "Italian", "Turkish", "Lebanese", "Georgian", "Iranian", "Indian", "Jewish Sephardic"]',
'{"snps": ["M172", "M410", "M102"], "mutations": ["M172"], "subclade_count": 110, "discovery_year": 2000}',
'#EAB308'),

-- G2a - Anatolian Farmer
('G2a', 'paternal', 'G2a (G-P15)',
'Associated with early Neolithic farmers from Anatolia. Found in the Caucasus and Mediterranean.',
'G2a was one of the dominant haplogroups among the first farmers who spread from Anatolia into Europe during the Neolithic Revolution (8,000-6,000 years ago). It is found at high frequencies in the Caucasus (particularly among Ossetians and Georgians) and maintains moderate frequencies around the Mediterranean. In most of Europe, G2a was largely replaced by incoming Bronze Age Indo-Europeans but remains as a significant minority.',
'Anatolia/Caucasus',
'25,000-30,000 years ago',
'[{"region": "Georgia", "percentage": 35, "population": "Georgian"}, {"region": "Ossetia", "percentage": 60, "population": "Ossetian"}, {"region": "Sardinia", "percentage": 15, "population": "Sardinian"}, {"region": "Greece", "percentage": 8, "population": "Greek"}, {"region": "Italy", "percentage": 7, "population": "Italian"}]',
'G2a originated in the Near East/Caucasus region. During the Neolithic, G2a-bearing farmers migrated from Anatolia into Europe, bringing agriculture to the continent. Ancient DNA from Neolithic sites in Europe shows very high frequencies of G2a. However, during the Bronze Age, incoming Indo-European speakers (carrying R1b and R1a) largely replaced G2a males in most of Europe. The Caucasus and parts of the Mediterranean retained higher frequencies.',
'[{"name": "Ötzi the Iceman", "description": "5,300-year-old Alpine mummy", "verified": true}, {"name": "Joseph Stalin", "description": "Soviet leader (Georgian)", "verified": true}]',
'[{"name": "G", "relationship": "parent"}, {"name": "G2a1", "relationship": "child"}, {"name": "G2b", "relationship": "sibling"}]',
'["Georgian", "Ossetian", "Sardinian", "Greek", "Italian", "Iranian", "Ashkenazi Jewish"]',
'{"snps": ["P15", "U1", "L91"], "mutations": ["P15"], "subclade_count": 45, "discovery_year": 2001}',
'#84CC16'),

-- N1a - Uralic/Siberian
('N1a', 'paternal', 'N1a (N-M46)',
'Common among Uralic and Siberian peoples. Associated with the spread of Uralic languages.',
'N1a is the most common Y-DNA haplogroup among Uralic-speaking peoples, including Finns, Estonians, and various Siberian populations. It originated in East Asia and spread westward across northern Eurasia. The haplogroup is associated with the spread of Uralic languages (Finnish, Estonian, Hungarian) and maintains high frequencies in Finland, Estonia, and among Siberian groups like the Yakuts.',
'East Asia/Siberia',
'15,000-20,000 years ago',
'[{"region": "Finland", "percentage": 62, "population": "Finnish"}, {"region": "Estonia", "percentage": 34, "population": "Estonian"}, {"region": "Yakutia", "percentage": 90, "population": "Yakut"}, {"region": "Latvia", "percentage": 42, "population": "Latvian"}, {"region": "Lithuania", "percentage": 42, "population": "Lithuanian"}]',
'N1a originated in East Asia during the last Ice Age and spread westward across Siberia following the tundra and taiga. It entered northeastern Europe around 4,000-5,000 years ago with Uralic-speaking peoples. The haplogroup spread with the Comb Ceramic culture in the Baltic region. Among Yakuts in Siberia, N1a has undergone a dramatic founder effect, reaching over 90% frequency.',
'[{"name": "Rurik", "description": "Founder of the Rurikid dynasty of Rus (N1a1a1)", "verified": true}]',
'[{"name": "N", "relationship": "parent"}, {"name": "N1a1", "relationship": "child"}, {"name": "N1b", "relationship": "sibling"}]',
'["Finnish", "Estonian", "Yakut", "Saami", "Hungarian", "Russian", "Latvian", "Lithuanian"]',
'{"snps": ["M46", "L550", "VL29"], "mutations": ["M46"], "subclade_count": 40, "discovery_year": 2001}',
'#06B6D4'),

-- O1 - East Asian
('O1', 'paternal', 'O1 (O-M119)',
'Common in East and Southeast Asia. Associated with Austronesian expansion.',
'O1 is found predominantly in East and Southeast Asia, with high frequencies in Taiwan, southern China, and throughout Maritime Southeast Asia and the Pacific Islands. It is strongly associated with the Austronesian expansion, which spread from Taiwan throughout the Pacific over the past 5,000 years. O1 is also found among various indigenous peoples of Southeast Asia and southern China.',
'East Asia (Southern China/Taiwan)',
'30,000-35,000 years ago',
'[{"region": "Taiwan", "percentage": 55, "population": "Taiwanese aborigines"}, {"region": "Philippines", "percentage": 25, "population": "Filipino"}, {"region": "Indonesia", "percentage": 18, "population": "Indonesian"}, {"region": "Madagascar", "percentage": 12, "population": "Malagasy"}, {"region": "Polynesia", "percentage": 65, "population": "Polynesian"}]',
'O1 originated in East Asia and became associated with Austronesian peoples. Around 5,000 years ago, O1-carrying populations from Taiwan began the greatest maritime expansion in human history, spreading across Island Southeast Asia, Melanesia, Micronesia, and Polynesia. They reached as far as Madagascar to the west and Easter Island to the east.',
'[{"name": "Austronesian navigators", "description": "Spread across Pacific", "verified": true}]',
'[{"name": "O", "relationship": "parent"}, {"name": "O1a", "relationship": "child"}, {"name": "O1b", "relationship": "child"}, {"name": "O2", "relationship": "sibling"}]',
'["Taiwanese aboriginal", "Filipino", "Indonesian", "Polynesian", "Maori", "Hawaiian", "Malagasy"]',
'{"snps": ["M119", "M176", "M95"], "mutations": ["M119"], "subclade_count": 35, "discovery_year": 2002}',
'#EC4899'),

-- O2 - Han Chinese/Vietnamese
('O2', 'paternal', 'O2 (O-M122)',
'The most common haplogroup in East Asia, dominant among Han Chinese, Koreans, and Vietnamese.',
'O2 is the most prevalent Y-DNA haplogroup in East Asia, found in over 50% of Han Chinese men and high frequencies in Korea, Vietnam, and Japan. It is associated with the Neolithic expansion of rice and millet agriculture in China. The haplogroup diversified extensively during the Bronze and Iron Ages in China and spread with the expansion of Chinese civilization and related populations.',
'East Asia (China)',
'25,000-30,000 years ago',
'[{"region": "China", "percentage": 55, "population": "Han Chinese"}, {"region": "Korea", "percentage": 45, "population": "Korean"}, {"region": "Vietnam", "percentage": 40, "population": "Vietnamese"}, {"region": "Japan", "percentage": 32, "population": "Japanese"}, {"region": "Thailand", "percentage": 28, "population": "Thai"}]',
'O2 originated in East Asia and underwent major expansions with the development of agriculture in China. It spread southward with the expansion of the Baiyue peoples and northward into Korea and Japan. Different subclades show distinct patterns related to historical Chinese dynasties and population movements. O2a2b1a is particularly associated with Han Chinese expansion.',
'[{"name": "Confucius", "description": "Chinese philosopher (traditional claim)", "verified": false}]',
'[{"name": "O", "relationship": "parent"}, {"name": "O2a", "relationship": "child"}, {"name": "O2b", "relationship": "child"}, {"name": "O1", "relationship": "sibling"}]',
'["Han Chinese", "Korean", "Vietnamese", "Japanese", "Thai", "Tibetan", "Mongolian"]',
'{"snps": ["M122", "M134", "M117"], "mutations": ["M122"], "subclade_count": 150, "discovery_year": 2001}',
'#F472B6'),

-- Q - Native American/Siberian
('Q', 'paternal', 'Q (Q-M242)',
'The founding paternal lineage of Native Americans. Also found in Siberia.',
'Q is the predominant Y-DNA haplogroup among Native American populations, representing the paternal lineage of the first Americans who crossed Beringia approximately 15,000-20,000 years ago. In the Americas, Q (particularly subclades Q-M3 and Q-Z780) reaches near-fixation in many indigenous populations. Q is also found at moderate frequencies in Siberia among groups like the Kets and Selkups, representing the Asian source population.',
'Siberia/Central Asia',
'15,000-20,000 years ago',
'[{"region": "South America", "percentage": 92, "population": "Indigenous South American"}, {"region": "North America", "percentage": 79, "population": "Indigenous North American"}, {"region": "Central America", "percentage": 91, "population": "Maya"}, {"region": "Siberia", "percentage": 34, "population": "Ket"}, {"region": "Mexico", "percentage": 50, "population": "Indigenous Mexican"}]',
'Q originated in Central Asia/Siberia and spread into the Americas via Beringia during the Last Glacial Maximum. The first Americans carried Q-M3 and related lineages. From Beringia, these populations spread rapidly throughout North and South America, reaching Patagonia by 14,000 years ago. The haplogroup diversified into many American-specific subclades.',
'[{"name": "Sitting Bull", "description": "Hunkpapa Lakota leader", "verified": true}, {"name": "Geronimo", "description": "Apache leader", "verified": true}]',
'[{"name": "P", "relationship": "parent"}, {"name": "Q1a", "relationship": "child"}, {"name": "Q1b", "relationship": "child"}, {"name": "R", "relationship": "sibling"}]',
'["Native American", "Maya", "Aztec", "Inca", "Apache", "Navajo", "Inuit", "Yakut", "Ket"]',
'{"snps": ["M242", "M3", "M346"], "mutations": ["M242"], "subclade_count": 50, "discovery_year": 2002}',
'#8B5CF6'),

-- ============================================
-- mtDNA (MATERNAL) HAPLOGROUPS
-- ============================================

-- H - Most common European maternal
('H', 'maternal', 'H (mtDNA)',
'The most common maternal haplogroup in Europe, found in about 40% of Europeans.',
'H is the most prevalent mtDNA haplogroup in Europe, with peak frequencies in the Iberian Peninsula and British Isles. It emerged approximately 20,000-25,000 years ago and expanded significantly from refugia in Iberia following the Last Glacial Maximum. H is associated with post-glacial recolonization of Europe and later expansions. Numerous subclades exist, with H1 being particularly common in Western Europe.',
'Near East/Europe',
'20,000-25,000 years ago',
'[{"region": "Basque Country", "percentage": 55, "population": "Basque"}, {"region": "Portugal", "percentage": 48, "population": "Portuguese"}, {"region": "Ireland", "percentage": 45, "population": "Irish"}, {"region": "UK", "percentage": 44, "population": "British"}, {"region": "France", "percentage": 43, "population": "French"}]',
'H originated in the Near East and spread into Europe during the Upper Paleolithic. During the Last Glacial Maximum, H carriers survived in southern refugia, particularly in Iberia. Following the ice age, H expanded northward, becoming the dominant maternal lineage in Europe. The Neolithic expansion also brought additional H lineages into Europe.',
'[{"name": "Cheddar Man''s descendant", "description": "British man shares mtDNA with 9,000-year-old skeleton", "verified": true}, {"name": "Marie Antoinette", "description": "Queen of France", "verified": true}]',
'[{"name": "HV", "relationship": "parent"}, {"name": "H1", "relationship": "child"}, {"name": "H3", "relationship": "child"}, {"name": "V", "relationship": "sibling"}]',
'["European", "Basque", "Irish", "British", "French", "German", "Italian", "Scandinavian"]',
'{"snps": ["G2706A", "T7028C"], "mutations": ["263G", "8860G", "15326G"], "subclade_count": 90, "discovery_year": 1987}',
'#3B82F6'),

-- L2 - Sub-Saharan African
('L2', 'maternal', 'L2 (mtDNA)',
'Major African maternal lineage, common in West and Central Africa.',
'L2 is one of the most common mtDNA haplogroups in Sub-Saharan Africa, with high frequencies in West and Central Africa. It is particularly associated with Bantu-speaking populations and the Bantu expansion. L2a is the most common subclade and was heavily represented among enslaved Africans, making it the most common African-origin haplogroup among African Americans.',
'Africa (West-Central)',
'70,000-90,000 years ago',
'[{"region": "Senegal", "percentage": 35, "population": "Senegalese"}, {"region": "Nigeria", "percentage": 25, "population": "Nigerian"}, {"region": "Ghana", "percentage": 28, "population": "Ghanaian"}, {"region": "African Americans", "percentage": 30, "population": "African American"}, {"region": "Brazil", "percentage": 25, "population": "Afro-Brazilian"}]',
'L2 is part of the deep African mtDNA structure and originated in Africa tens of thousands of years ago. It spread throughout Sub-Saharan Africa, becoming particularly associated with West African populations. L2a spread further with the Bantu expansion and later was carried to the Americas through the transatlantic slave trade, where it remains the most common African-derived haplogroup.',
'[{"name": "Oprah Winfrey", "description": "American media mogul (L2a1)", "verified": true}]',
'[{"name": "L", "relationship": "parent"}, {"name": "L2a", "relationship": "child"}, {"name": "L2b", "relationship": "child"}, {"name": "L3", "relationship": "sibling"}]',
'["West African", "Yoruba", "Hausa", "African American", "Afro-Brazilian", "Jamaican"]',
'{"snps": ["T16390C", "G10143A"], "mutations": ["10115T", "10873C"], "subclade_count": 45, "discovery_year": 1990}',
'#F97316'),

-- L3 - Out of Africa maternal lineage
('L3', 'maternal', 'L3 (mtDNA)',
'The maternal lineage that gave rise to all non-African mtDNA haplogroups.',
'L3 is a pivotal mtDNA haplogroup as it is the ancestor of all non-African mitochondrial lineages (haplogroups M and N). It originated in East Africa around 60,000-70,000 years ago, and a subset of L3 carriers successfully migrated out of Africa, founding all subsequent non-African populations. L3 itself remains common in Africa, particularly in East Africa.',
'East Africa',
'60,000-70,000 years ago',
'[{"region": "Ethiopia", "percentage": 38, "population": "Ethiopian"}, {"region": "Sudan", "percentage": 25, "population": "Sudanese"}, {"region": "East Africa", "percentage": 30, "population": "East African"}, {"region": "Tanzania", "percentage": 20, "population": "Tanzanian"}]',
'L3 emerged in East Africa and represents a crucial moment in human history. Around 70,000 years ago, a small group of L3-carrying individuals migrated out of Africa via the southern route (across the Bab el-Mandeb strait) or northern route (via Sinai). Their descendants, carrying haplogroups M and N (both derived from L3), colonized the rest of the world. L3 remains the most common haplogroup in East Africa.',
'[{"name": "Mitochondrial Eve''s descendant", "description": "L3 is one of the oldest surviving lineages", "verified": true}]',
'[{"name": "L", "relationship": "parent"}, {"name": "M", "relationship": "child"}, {"name": "N", "relationship": "child"}, {"name": "L2", "relationship": "sibling"}]',
'["Ethiopian", "Somali", "Sudanese", "Eritrean", "Dinka", "Nuer"]',
'{"snps": ["A769G", "A1018G"], "mutations": ["10398G", "15301G"], "subclade_count": 55, "discovery_year": 1992}',
'#EF4444'),

-- U - Ancient European
('U', 'maternal', 'U (mtDNA)',
'Ancient European maternal lineage, common among hunter-gatherers and Saami people.',
'U is one of the oldest mtDNA haplogroups found in Europe, with roots going back to the Upper Paleolithic. Subclade U5 is particularly associated with Mesolithic European hunter-gatherers and remains common among Saami people in northern Scandinavia. Other subclades (U2, U3, U4, U6) show distinct geographic distributions across Europe and surrounding regions.',
'Near East/Europe',
'50,000-55,000 years ago',
'[{"region": "Saami (Finland)", "percentage": 48, "population": "Saami"}, {"region": "Finland", "percentage": 25, "population": "Finnish"}, {"region": "Scandinavia", "percentage": 15, "population": "Scandinavian"}, {"region": "UK", "percentage": 12, "population": "British"}, {"region": "Russia", "percentage": 10, "population": "Russian"}]',
'U originated in the Near East and spread into Europe during the Upper Paleolithic. U5 was dominant among Mesolithic hunter-gatherers in Europe but was largely replaced during the Neolithic by haplogroups brought by farmers. However, U5 persisted in northern Europe, particularly among Saami populations. U6 took a different path, spreading into North Africa with back-migrations from the Near East.',
'[{"name": "Cheddar Man", "description": "10,000-year-old British skeleton (U5b1)", "verified": true}]',
'[{"name": "R", "relationship": "parent"}, {"name": "U5", "relationship": "child"}, {"name": "U6", "relationship": "child"}, {"name": "K", "relationship": "child"}]',
'["Saami", "Finnish", "Scandinavian", "European", "Berber (U6)"]',
'{"snps": ["A11467G", "A12308G"], "mutations": ["73G", "7028T"], "subclade_count": 85, "discovery_year": 1992}',
'#22C55E'),

-- K - Otzi the Iceman lineage
('K', 'maternal', 'K (mtDNA)',
'Common in Europe and the Middle East. Associated with Neolithic farmers.',
'K is a subclade of U that became particularly prevalent among Neolithic farmers and spread throughout Europe with the agricultural expansion. It is found in about 10% of Europeans and has higher frequencies in certain Jewish populations (up to 30% among Ashkenazi). K is also notable for being the haplogroup of Ötzi the Iceman, demonstrating its antiquity in Europe.',
'Near East',
'20,000-25,000 years ago',
'[{"region": "Ashkenazi Jews", "percentage": 32, "population": "Ashkenazi Jewish"}, {"region": "Europe", "percentage": 10, "population": "European"}, {"region": "Middle East", "percentage": 12, "population": "Middle Eastern"}, {"region": "Kurdistan", "percentage": 18, "population": "Kurdish"}]',
'K emerged from U8 in the Near East and spread into Europe primarily with Neolithic farmers. It maintained moderate frequencies throughout Europe and became particularly concentrated in certain populations, including Ashkenazi Jews through founder effects. The discovery that Ötzi the Iceman (5,300 years old) belonged to haplogroup K1 demonstrated its early presence in European farmer populations.',
'[{"name": "Ötzi the Iceman", "description": "5,300-year-old Alpine mummy (K1)", "verified": true}]',
'[{"name": "U8", "relationship": "parent"}, {"name": "K1", "relationship": "child"}, {"name": "K2", "relationship": "child"}]',
'["European", "Ashkenazi Jewish", "Kurdish", "Middle Eastern"]',
'{"snps": ["A9055G", "A10550G"], "mutations": ["497T", "1189C"], "subclade_count": 40, "discovery_year": 1995}',
'#10B981'),

-- B - Polynesian/Native American
('B', 'maternal', 'B (mtDNA)',
'Common in East Asia, Polynesia, and among Native Americans.',
'B is an mtDNA haplogroup found throughout East Asia, the Pacific Islands, and the Americas. B4 and its subclades are particularly associated with the Austronesian expansion into the Pacific, while B2 is found among Native American populations. The haplogroup demonstrates the ancient connections between Asian, Pacific, and American populations.',
'East Asia',
'40,000-50,000 years ago',
'[{"region": "Polynesia", "percentage": 95, "population": "Polynesian"}, {"region": "Native American", "percentage": 15, "population": "Indigenous American"}, {"region": "Japan", "percentage": 8, "population": "Japanese"}, {"region": "China", "percentage": 10, "population": "Chinese"}, {"region": "Madagascar", "percentage": 20, "population": "Malagasy"}]',
'B originated in East Asia from haplogroup R. B4 spread with Austronesian peoples throughout Island Southeast Asia and into the Pacific, reaching Polynesia where it became nearly fixed. B2 was part of the founding maternal lineages that entered the Americas via Beringia. The near-fixation of B4a1a (the "Polynesian motif") in Polynesia represents one of the clearest examples of founder effect in human genetics.',
'[{"name": "Polynesian navigators", "description": "Carried B4a1a across Pacific", "verified": true}]',
'[{"name": "R", "relationship": "parent"}, {"name": "B2", "relationship": "child"}, {"name": "B4", "relationship": "child"}]',
'["Polynesian", "Maori", "Hawaiian", "Native American", "Chinese", "Japanese", "Malagasy"]',
'{"snps": ["G8281A", "C8270T"], "mutations": ["16189C", "16519C"], "subclade_count": 35, "discovery_year": 1991}',
'#EC4899'),

-- A - Native American/East Asian
('A', 'maternal', 'A (mtDNA)',
'One of the founding maternal lineages of Native Americans, also common in East Asia.',
'A is one of the five founding mtDNA haplogroups of Native Americans (A, B, C, D, X) and is also common in East and Northeast Asia. In the Americas, A2 is particularly widespread, found from Alaska to Patagonia. The haplogroup demonstrates the Asian origins of Indigenous American populations.',
'East Asia/Siberia',
'30,000-40,000 years ago',
'[{"region": "Siberia", "percentage": 25, "population": "Siberian"}, {"region": "Native American", "percentage": 22, "population": "Indigenous American"}, {"region": "Eskimo-Aleut", "percentage": 35, "population": "Inuit/Aleut"}, {"region": "Japan", "percentage": 7, "population": "Japanese"}]',
'A originated in East Asia and spread to Northeast Asia and Siberia. A subset of A (particularly A2) was carried into the Americas via Beringia during the founding migration approximately 15,000-20,000 years ago. A is particularly common among Eskimo-Aleut populations and is found throughout the Americas at moderate frequencies.',
'[{"name": "First Americans", "description": "A2 was among founding lineages", "verified": true}]',
'[{"name": "N", "relationship": "parent"}, {"name": "A2", "relationship": "child"}, {"name": "A4", "relationship": "child"}]',
'["Native American", "Inuit", "Aleut", "Siberian", "Japanese", "Chinese"]',
'{"snps": ["G663A", "T16290C"], "mutations": ["235G", "663G"], "subclade_count": 25, "discovery_year": 1990}',
'#8B5CF6'),

-- C - Siberian/Native American
('C', 'maternal', 'C (mtDNA)',
'Common in Siberia, East Asia, and among Native Americans.',
'C is a major mtDNA haplogroup in northern and eastern Asia, with subclades spreading into the Americas. C1 was one of the founding haplogroups brought to the Americas, while C4 is common throughout East Asia and Siberia. The haplogroup reflects ancient population movements across northern Eurasia and into the New World.',
'East Asia',
'40,000-50,000 years ago',
'[{"region": "Siberia", "percentage": 30, "population": "Siberian"}, {"region": "Native American", "percentage": 15, "population": "Indigenous American"}, {"region": "Mongolia", "percentage": 18, "population": "Mongolian"}, {"region": "Central Asia", "percentage": 12, "population": "Central Asian"}]',
'C originated in East Asia and diversified throughout northern Asia. C1 was carried into the Americas with the first migration, while other subclades remained in Asia. The distribution of C reflects both the initial peopling of the Americas and later movements across the Eurasian Steppe.',
'[{"name": "Ancient Siberians", "description": "C was common in Paleolithic Siberia", "verified": true}]',
'[{"name": "M", "relationship": "parent"}, {"name": "C1", "relationship": "child"}, {"name": "C4", "relationship": "child"}, {"name": "D", "relationship": "sibling"}]',
'["Siberian", "Native American", "Mongolian", "Central Asian", "Japanese"]',
'{"snps": ["T14318C", "T13263C"], "mutations": ["73G", "249d"], "subclade_count": 30, "discovery_year": 1991}',
'#06B6D4'),

-- D - East Asian/Native American
('D', 'maternal', 'D (mtDNA)',
'Major East Asian haplogroup, also one of the founding Native American lineages.',
'D is one of the most common mtDNA haplogroups in East Asia, particularly in Japan, Korea, and China. D1 and D4h3 were among the founding maternal lineages of Native Americans. The haplogroup''s distribution spans from Japan to Patagonia, reflecting both its East Asian origins and its role in the peopling of the Americas.',
'East Asia',
'40,000-50,000 years ago',
'[{"region": "Japan", "percentage": 38, "population": "Japanese"}, {"region": "China", "percentage": 25, "population": "Chinese"}, {"region": "Korea", "percentage": 32, "population": "Korean"}, {"region": "Native American", "percentage": 20, "population": "Indigenous American"}]',
'D emerged in East Asia and became one of the dominant mtDNA haplogroups in the region. Multiple subclades of D were carried into the Americas during the initial migration. D4h3 appears to have followed a coastal route south, as it is found at higher frequencies in Pacific coastal populations of the Americas. In Asia, D4 is particularly diverse and common in Japan.',
'[{"name": "Emperor Showa (Hirohito)", "description": "Japanese emperor (traditional claim)", "verified": false}]',
'[{"name": "M", "relationship": "parent"}, {"name": "D1", "relationship": "child"}, {"name": "D4", "relationship": "child"}, {"name": "C", "relationship": "sibling"}]',
'["Japanese", "Korean", "Chinese", "Native American", "Mongolian"]',
'{"snps": ["C5178A", "T16362C"], "mutations": ["4883T", "5178A"], "subclade_count": 75, "discovery_year": 1991}',
'#F472B6'),

-- J - Ice Age European survivor
('J', 'maternal', 'J (mtDNA)',
'European/Middle Eastern lineage, spread with Neolithic farmers.',
'J is an mtDNA haplogroup found throughout Europe and the Middle East, with frequencies around 8-12% in most European populations. It is associated with the spread of Neolithic agriculture from the Near East into Europe. J1c and J2 are the most common subclades in Europe. J is also notable for its presence in certain Jewish populations.',
'Near East',
'40,000-45,000 years ago',
'[{"region": "Arabian Peninsula", "percentage": 25, "population": "Arabian"}, {"region": "Europe", "percentage": 12, "population": "European"}, {"region": "UK", "percentage": 11, "population": "British"}, {"region": "Ireland", "percentage": 10, "population": "Irish"}]',
'J originated in the Near East and entered Europe primarily with Neolithic farmers around 8,000-6,000 years ago. Its frequency increased significantly during the Neolithic transition. Different subclades show distinct patterns: J1 is more common in the Near East and spread with early farmers, while J2 may have spread later with different population movements.',
'[{"name": "Bryan Sykes", "description": "Named ancestor ''Jasmine'' for haplogroup J", "verified": true}]',
'[{"name": "JT", "relationship": "parent"}, {"name": "J1", "relationship": "child"}, {"name": "J2", "relationship": "child"}, {"name": "T", "relationship": "sibling"}]',
'["European", "Middle Eastern", "Arabian", "Jewish"]',
'{"snps": ["A12612G", "G13708A"], "mutations": ["295T", "462T"], "subclade_count": 45, "discovery_year": 1996}',
'#EAB308'),

-- T - European/Middle Eastern
('T', 'maternal', 'T (mtDNA)',
'Found throughout Europe and the Middle East, associated with Neolithic expansion.',
'T is a sister clade to J, both derived from JT. It is found at frequencies of 6-10% in most European populations and higher in parts of the Middle East. T is associated with Neolithic farmers who spread agriculture into Europe. The subclade T2 is particularly common and diversified within Europe.',
'Near East',
'25,000-30,000 years ago',
'[{"region": "Middle East", "percentage": 15, "population": "Middle Eastern"}, {"region": "Europe", "percentage": 9, "population": "European"}, {"region": "Caucasus", "percentage": 12, "population": "Georgian"}, {"region": "UK", "percentage": 8, "population": "British"}]',
'T originated in the Near East and spread into Europe with Neolithic farmers. Like J, it increased significantly in frequency during the Neolithic transition. T is found throughout Europe and the Middle East, with T2 being particularly common in Western Europe. The haplogroup demonstrates the significant genetic impact of the agricultural revolution on European populations.',
'[{"name": "Bryan Sykes", "description": "Named ancestor ''Tara'' for haplogroup T", "verified": true}]',
'[{"name": "JT", "relationship": "parent"}, {"name": "T1", "relationship": "child"}, {"name": "T2", "relationship": "child"}, {"name": "J", "relationship": "sibling"}]',
'["European", "Middle Eastern", "Georgian", "Jewish"]',
'{"snps": ["A8701G", "T10463C"], "mutations": ["16126C", "16294T"], "subclade_count": 35, "discovery_year": 1996}',
'#84CC16'),

-- V - Post-glacial European
('V', 'maternal', 'V (mtDNA)',
'Associated with post-glacial recolonization of Europe from Iberian refugia.',
'V is a European mtDNA haplogroup that emerged from the HV clade, sister to haplogroup H. It is particularly associated with the Saami people of northern Scandinavia and is also found at moderate frequencies in the Iberian Peninsula and parts of northwestern Europe. V likely expanded from Iberian refugia following the Last Glacial Maximum.',
'Europe (Iberia)',
'15,000-18,000 years ago',
'[{"region": "Saami (Scandinavia)", "percentage": 40, "population": "Saami"}, {"region": "Basque Country", "percentage": 12, "population": "Basque"}, {"region": "Cantabria", "percentage": 15, "population": "Cantabrian"}, {"region": "Scandinavia", "percentage": 6, "population": "Scandinavian"}]',
'V emerged in Western Europe, likely in the Iberian refugium during or after the Last Glacial Maximum. It spread northward with post-glacial recolonization and became particularly prominent among Saami populations, where it may represent an ancient pre-Uralic substrate. The bimodal distribution (high in Saami and moderate in Iberia) reflects its deep European roots.',
'[{"name": "Saami ancestors", "description": "V is ancestral to many Saami people", "verified": true}]',
'[{"name": "HV", "relationship": "parent"}, {"name": "V1", "relationship": "child"}, {"name": "V7", "relationship": "child"}, {"name": "H", "relationship": "sibling"}]',
'["Saami", "Basque", "Scandinavian", "Spanish"]',
'{"snps": ["G4580A", "T72C"], "mutations": ["72C", "15904C"], "subclade_count": 15, "discovery_year": 1996}',
'#F59E0B'),

-- X - Trans-Atlantic mystery lineage
('X', 'maternal', 'X (mtDNA)',
'Rare haplogroup found in Europe, Middle East, and Native Americans.',
'X is an unusual mtDNA haplogroup found at low frequencies in Europe and the Middle East (X2) and among certain Native American populations (X2a). Its presence in both the Old World and New World has generated significant scientific interest. In Native Americans, X2a is found primarily in northeastern North America among groups like the Ojibwe.',
'Near East',
'20,000-30,000 years ago',
'[{"region": "Druze (Israel)", "percentage": 25, "population": "Druze"}, {"region": "Native American (Northeast)", "percentage": 5, "population": "Ojibwe"}, {"region": "Europe", "percentage": 2, "population": "European"}, {"region": "Middle East", "percentage": 4, "population": "Middle Eastern"}]',
'X originated in the Near East and spread into Europe. The presence of X2a among Native Americans has been much debated, with current evidence supporting it as one of the founding lineages carried via Beringia, though possibly via a distinct migration wave. X2a is not found in East Asia, suggesting a possible northern or different route to the Americas.',
'[{"name": "Kennewick Man", "description": "Ancient skeleton related to X2a (debated)", "verified": false}]',
'[{"name": "N", "relationship": "parent"}, {"name": "X2", "relationship": "child"}, {"name": "X2a", "relationship": "child"}]',
'["Native American (Northeastern)", "Druze", "European", "Middle Eastern"]',
'{"snps": ["T6221C", "C6371T"], "mutations": ["73G", "16189C"], "subclade_count": 20, "discovery_year": 1998}',
'#A855F7');

-- Create index for faster lookups by name
CREATE INDEX IF NOT EXISTS idx_haplogroups_name ON haplogroups(name);
CREATE INDEX IF NOT EXISTS idx_haplogroups_type ON haplogroups(type);

-- Add full text search vector
ALTER TABLE haplogroups ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE haplogroups SET search_vector =
  to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(full_name, '') || ' ' ||
    coalesce(short_description, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(origin_region, '')
  );

CREATE INDEX IF NOT EXISTS idx_haplogroups_search ON haplogroups USING gin(search_vector);
