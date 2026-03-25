-- VerticalLog Database Initialization

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sites (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK(type IN ('Falaise', 'Bloc', 'Salle')),
  location VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS climbing_routes (
  id SERIAL PRIMARY KEY,
  site_id INT REFERENCES sites(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  grade VARCHAR(10) NOT NULL,
  style VARCHAR(20) CHECK(style IN ('Voie', 'Boulder', 'Trad')),
  description TEXT,
  video_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logbook (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  route_id INT REFERENCES climbing_routes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  feeling INT CHECK(feeling BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data

-- Admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role) VALUES
  ('admin', 'admin@verticallog.fr', '$2b$10$PjEObkDVkfPAR/tux3FbR.dzfz23LToUtnhBkvLBDTaBvmBLr/roe', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Sample sites
INSERT INTO sites (name, type, location, description, image_url, latitude, longitude, created_by) VALUES
  (
    'Gorges du Verdon',
    'Falaise',
    'Alpes-de-Haute-Provence, France',
    'Les Gorges du Verdon offrent un terrain d''escalade exceptionnel avec des voies de tous niveaux dans un cadre naturel spectaculaire. Le calcaire compact et les grandes falaises en font un site incontournable pour tout grimpeur. Des voies de 5a à 8b+ sont disponibles sur plusieurs secteurs emblématiques.',
    'https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=800&q=80',
    43.7483,
    6.3453,
    1
  ),
  (
    'Bloc de Fontainebleau',
    'Bloc',
    'Seine-et-Marne, Île-de-France, France',
    'La forêt de Fontainebleau est le berceau du bloc mondial. Ses rochers de grès aux formes insolites proposent des milliers de problèmes de tous niveaux, balisés par circuit de couleurs. Un terrain de jeu unique à seulement une heure de Paris, idéal pour progresser en technique.',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    48.4031,
    2.6199,
    1
  ),
  (
    'Salle Arkose Nation',
    'Salle',
    '17 Rue Campra, 75019 Paris, France',
    'Arkose Nation est l''une des plus grandes salles d''escalade de Paris avec plus de 2000 m² de murs. Proposant blocs et voies de tous niveaux dans une ambiance conviviale, c''est l''endroit idéal pour s''entraîner toute l''année, quelle que soit la météo. Cours et coaching disponibles.',
    'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80',
    48.8842,
    2.3775,
    1
  )
ON CONFLICT DO NOTHING;

-- Additional sites
INSERT INTO sites (name, type, location, description, image_url, latitude, longitude, created_by) VALUES
  (
    'Calanques de Marseille',
    'Falaise',
    'Bouches-du-Rhône, France',
    'Les Calanques offrent un cadre grandiose entre mer et calcaire blanc. Des centaines de voies de tous niveaux sur un calcaire d''exception, avec vue sur la Méditerranée. Site incontournable du sud de la France, accessible en bateau ou à pied.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    43.2148, 5.4379, 1
  ),
  (
    'Gorges du Tarn',
    'Falaise',
    'Lozère, France',
    'Les falaises des Gorges du Tarn proposent une escalade variée sur calcaire, avec des voies de 5a à 8a. Le cadre sauvage et la rivière en contrebas en font un site d''exception pour les grimpeurs de tous niveaux.',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    44.2167, 3.1833, 1
  ),
  (
    'Buoux',
    'Falaise',
    'Vaucluse, France',
    'Site mythique de l''escalade française des années 80. Les falaises de Buoux ont vu naître les premières 8a et restent une référence mondiale. Calcaire sculpté, réglettes fines et voies techniques pour les grimpeurs confirmés.',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    43.8667, 5.3833, 1
  ),
  (
    'Céüse',
    'Falaise',
    'Hautes-Alpes, France',
    'Considéré comme l''un des plus beaux sites d''escalade au monde, Céüse offre un calcaire exceptionnel et des voies mythiques. L''accès à pied (1h30) renforce le caractère sauvage du lieu. Voies de 6a à 9a+.',
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80',
    44.5153, 6.0853, 1
  ),
  (
    'Le Saussois',
    'Falaise',
    'Yonne, Bourgogne, France',
    'Falaise emblématique de Bourgogne dominant la rivière Yonne. Voies historiques de l''escalade française, accessible toute l''année. Le calcaire compact et les grandes dalles en font un site apprécié des grimpeurs de tous niveaux.',
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    47.6167, 3.6833, 1
  ),
  (
    'Presles',
    'Falaise',
    'Vercors, Isère, France',
    'Les falaises de Presles dominent les Gorges de la Bourne dans le massif du Vercors. Un site remarquable avec des voies longues sur calcaire gris, dans un environnement naturel préservé. Idéal pour les sorties en grandes voies.',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    45.0500, 5.5167, 1
  ),
  (
    'Orpierre',
    'Falaise',
    'Hautes-Alpes, France',
    'Village perché au coeur des Baronnies provençales, Orpierre propose un ensoleillement remarquable et des voies de tous niveaux. Le village medieval ajoute un charme unique à ce site familial et convivial.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    44.3167, 5.7000, 1
  ),
  (
    'Saint-Guilhem-le-Désert',
    'Falaise',
    'Hérault, Occitanie, France',
    'Au coeur de la Gorge de l''Hérault, Saint-Guilhem offre un calcaire de qualité avec des voies bien équipées. Le village medieval classé ajoute une dimension culturelle unique à la visite. Escalade de 5a à 8b.',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    43.7333, 3.5333, 1
  ),
  (
    'Buis-les-Baronnies',
    'Falaise',
    'Drôme Provençale, France',
    'Capitale de la lavande et de l''escalade provençale. Les falaises entourant le village proposent des voies ensoleillées toute l''année sur calcaire compact. Ambiance méditerranéenne et accès facile depuis le village.',
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80',
    44.2742, 5.2742, 1
  ),
  (
    'Targassonne',
    'Bloc',
    'Pyrénées-Orientales, France',
    'Haut plateau de granit à 1600m d''altitude, Targassonne est le paradis du bloc en France. Des milliers de blocs disséminés dans la lande offrent des mouvements techniques et athlétiques sur granit rugueux. Ambiance montagnarde unique.',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    42.5000, 1.9833, 1
  ),
  (
    'Annot',
    'Bloc',
    'Alpes-de-Haute-Provence, France',
    'Les grès d''Annot offrent un terrain de bloc exceptionnel avec des formes géologiques spectaculaires. Les rochers aux teintes dorées et orangées proposent des problèmes variés dans un cadre provençal magnifique.',
    'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80',
    43.9667, 6.6667, 1
  ),
  (
    'Chateauvert',
    'Bloc',
    'Var, Provence, France',
    'Site de bloc méconnu mais exceptionnel dans le Var. Des blocs de calcaire de taille idéale proposent des problèmes variés de 4 à 8b dans une garrigue parfumée. Très fréquenté par les grimpeurs marseillais et toulonnais.',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    43.5167, 6.0500, 1
  ),
  (
    'Forêt de Rambouillet',
    'Bloc',
    'Yvelines, Île-de-France, France',
    'Alternative parisienne à Fontainebleau, la forêt de Rambouillet propose des blocs de grès plus intimes et moins fréquentés. Circuits balisés pour tous les niveaux dans un cadre forestier agréable toute l''année.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    48.6333, 1.8167, 1
  ),
  (
    'Climb Up Lyon',
    'Salle',
    '14 Rue Professeur Rochaix, 69003 Lyon, France',
    'Grande salle d''escalade lyonnaise avec blocs et voies sur plus de 1500 m². Structure moderne avec des tracés régulièrement renouvelés, une boutique et un espace fitness. Idéale pour s''entraîner au coeur de Lyon.',
    'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80',
    45.7480, 4.8547, 1
  ),
  (
    'Block''Out Paris Porte de la Chapelle',
    'Salle',
    '54 Rue de la Chapelle, 75018 Paris, France',
    'Une des plus grandes salles de bloc de Paris avec plus de 800 blocs disponibles. Ambiance urbaine et tracés créatifs pour tous les niveaux. Ouverture 7j/7 et coaching disponible.',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    48.8925, 2.3594, 1
  ),
  (
    'Vertical''Art Nantes',
    'Salle',
    '14 Bd du Massacre, 44800 Saint-Herblain, France',
    'La référence de l''escalade à Nantes. Salle polyvalente avec blocs, voies et dry-tooling. Plus de 3000 m² de structures, renouvellement hebdomadaire des voies et ambiance communautaire chaleureuse.',
    'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80',
    47.2180, -1.5836, 1
  ),
  (
    'Keep Climbing Grenoble',
    'Salle',
    '2 Rue des Entrepreneurs, 38320 Grenoble, France',
    'Salle d''escalade au pied des Alpes grenobleises. Voies et blocs pour tous les niveaux, avec des tracés inspirés du terrain naturel alpin. La salle idéale pour s''entraîner avant de partir en montagne.',
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80',
    45.1885, 5.7245, 1
  )
ON CONFLICT DO NOTHING;

-- Sample climbing routes
INSERT INTO climbing_routes (site_id, name, grade, style, description) VALUES
  (
    1,
    'La Grande Voie du Verdon',
    '6b+',
    'Voie',
    'Une voie magnifique sur calcaire compact avec une belle exposition. Plusieurs longueurs aériennes au-dessus des eaux turquoise du lac de Sainte-Croix. Idéale pour les grimpeurs confirmés cherchant un défi technique.'
  ),
  (
    1,
    'Pilier des Termites',
    '7a',
    'Voie',
    'Voie mythique du Verdon, engagée et athlétique. Dévers prononcés dans la partie centrale, finition sur dalle délicate. Une référence absolue pour les grimpeurs de niveau confirmé.'
  ),
  (
    2,
    'L''Isatis',
    '5c',
    'Boulder',
    'Classique du circuit bleu de Fontainebleau. Un beau problème de dalle technique sur grès patiné. Excellent point de départ pour découvrir la forêt et ses techniques de friction spécifiques.'
  ),
  (
    2,
    'Carnage',
    '7b',
    'Boulder',
    'Problème athlétique sur toit avec des mouvements de force explosive. Un must pour les grimpeurs de haut niveau cherchant à tester leur puissance et leur coordination sur des prises coupantes.'
  ),
  (
    3,
    'Voie d''initiation 6a',
    '6a',
    'Voie',
    'Voie d''initiation parfaitement équipée de la salle Arkose. Idéale pour progresser en technique de mouvement, avec des prises variées et un tracé pédagogique conçu par les moniteurs de la salle.'
  )
ON CONFLICT DO NOTHING;

-- Routes for additional sites (joined by site name for portability)
INSERT INTO climbing_routes (site_id, name, grade, style, description)
SELECT s.id, r.name, r.grade, r.style::VARCHAR, r.description
FROM sites s
JOIN (VALUES
  ('Calanques de Marseille', 'La Directe des Calanques', '6a', 'Voie', 'Voie classique en face sud avec vue imprenable sur la mer. Calcaire blanc patiné, mouvements dalles et réglettes. Incontournable pour tout grimpeur visitant Marseille.'),
  ('Calanques de Marseille', 'Voie des Goélands', '7a+', 'Voie', 'Voie athlétique en dévers avec des mouvements dynamiques. Une des plus belles lignes des Calanques, récompensée par un panorama exceptionnel au sommet.'),
  ('Calanques de Marseille', 'Initiation Calanques', '5b', 'Voie', 'Idéale pour découvrir l''escalade en falaise naturelle. Voie bien équipée sur calcaire solide, parfaite pour les débutants accompagnés d''un encadrant.'),
  ('Gorges du Tarn', 'La Rivière Verte', '6c', 'Voie', 'Longue voie en balcon au-dessus de la rivière. Calcaire gris très varié avec passages en dalle et en dévers. Ambiance sauvage garantie dans les gorges.'),
  ('Gorges du Tarn', 'Le Sauvage', '7b', 'Voie', 'Voie engagée sur le grand toit du secteur principal. Mouvements de gainage et d''opposition sur prises volcaniques. Réservée aux grimpeurs expérimentés.'),
  ('Gorges du Tarn', 'Premières Armes', '5a', 'Voie', 'Voie d''initiation idéale pour les familles. Bien équipée, avec des prises généreuses et un parcours varié permettant de découvrir l''escalade en pleine nature.'),
  ('Buoux', 'La Rose et le Vampire', '7c', 'Voie', 'Voie mythique des années 80, tracée par Patrick Edlinger. Réglettes tranchantes et enchaînements précis sur calcaire compact. Une référence historique de l''escalade sportive française.'),
  ('Buoux', 'Rêve de Papillon', '8a', 'Voie', 'L''une des voies les plus dures de Buoux. Mouvements très techniques en dalle sur des prises minuscules. Nécessite une préparation physique et mentale au top.'),
  ('Buoux', 'Les Dalles Grises', '5c', 'Voie', 'Classique du site accessible aux grimpeurs intermédiaires. Belle dalle grise avec friction et équilibre au programme. Une bonne voie pour progresser en technique de pied.'),
  ('Céüse', 'Biographie', '9a+', 'Voie', 'L''une des voies les plus célèbres au monde. Répétée par les meilleurs grimpeurs de la planète. Nécessite des années d''entraînement spécifique pour espérer l''enchaîner.'),
  ('Céüse', 'Le Privilège du Serpent', '7a', 'Voie', 'Voie accessible parmi les classiques de Céüse. Beau calcaire sculpté, mouvements fluides et variés. Une bonne introduction au style particulier du site.'),
  ('Céüse', 'Berlin', '8b+', 'Voie', 'Voie de référence mondiale répétée par les plus grands champions. Enchaînement de sections dures sans repos. La voie test par excellence pour les grimpeurs de haut niveau.'),
  ('Le Saussois', 'La Directe', '6a+', 'Voie', 'Voie historique en face principale du Saussois. Beau calcaire gris, ambiance raide. Une classique incontournable visible depuis la route.'),
  ('Le Saussois', 'Le Dièdre Jaune', '5a', 'Voie', 'Classique accueillante pour les grimpeurs débutants. Dièdre bien pris avec de bonnes prises. Idéale pour une première sortie en falaise naturelle.'),
  ('Presles', 'La Grande Voie', '6b', 'Voie', 'Grande voie en plusieurs longueurs avec une belle exposition. Vue magnifique sur les gorges de la Bourne depuis le sommet. Engagement modéré pour un grand souvenir.'),
  ('Presles', 'Le Mur Jaune', '7a+', 'Voie', 'Voie athlétique sur le secteur le plus raide de Presles. Mouvements de force sur prises positives, finition en dalle délicate. Un bon test pour les grimpeurs confirmés.'),
  ('Orpierre', 'Le Versant Sud', '5b', 'Voie', 'Voie familiale très ensoleillée sur le versant principal. Calcaire solide et bien équipé, idéal pour les sorties avec les enfants ou les débutants.'),
  ('Orpierre', 'La Voie des Chamois', '7b+', 'Voie', 'Voie engagée sur le secteur haut du village. Dévers soutenu avec des prises fuyantes nécessitant une bonne technique de pied. Vue imprenable sur le village médiéval.'),
  ('Saint-Guilhem-le-Désert', 'Le Chemin des Pèlerins', '6a', 'Voie', 'Voie classique du secteur principal. Beau calcaire orange avec des prises variées. Le départ depuis le village médiéval ajoute un charme particulier à l''ascension.'),
  ('Saint-Guilhem-le-Désert', 'La Gorge Sacrée', '7c', 'Voie', 'Voie dure et technique dans le secteur encaissé. Mouvements de gainage sur toit avec finition sur dalle. Réservée aux grimpeurs de niveau avancé.'),
  ('Buis-les-Baronnies', 'La Voie Provençale', '5c', 'Voie', 'Voie accessible dans le secteur principal. Parfumée par la lavande en été, cette voie offre une escalade variée avec vue sur le village et les champs de lavande.'),
  ('Buis-les-Baronnies', 'La Crête Solaire', '6c+', 'Voie', 'Voie technique sur calcaire compact très ensoleillé. Passages en dévers avec des prises positives mais nécessitant une lecture précise du mouvement.'),
  ('Targassonne', 'Le Bloc du Plateau', '6b', 'Boulder', 'Problème classique sur le bloc principal du plateau. Départ bas sur prises fines, sortie en force sur réglettes. Un must du site accessible après quelques sessions.'),
  ('Targassonne', 'La Fissure Granitique', '7a', 'Boulder', 'Beau problème de technique dans une fissure de granit. Mouvements de coincements et de friction spécifiques au granit. Un style très différent du calcaire.'),
  ('Targassonne', 'L''Arête du Vent', '5b', 'Boulder', 'Problème d''initiation sur une belle arête de granit. Mouvements d''équilibre et de friction faciles à appréhender. Idéal pour découvrir le bloc en granit.'),
  ('Annot', 'Le Grès Doré', '6c', 'Boulder', 'Problème sur une dalle de grès aux teintes dorées caractéristiques d''Annot. Friction maximale et lecture du relief millimétrique pour réussir ce bijou du site.'),
  ('Annot', 'La Trouée', '7b', 'Boulder', 'Traversée athlétique sur un bloc sculpté par l''érosion. Mouvements dynamiques et coordination nécessaires. Un des problèmes les plus photogéniques du site.'),
  ('Chateauvert', 'Le Bloc Provençal', '5a', 'Boulder', 'Problème d''initiation idéal pour découvrir le bloc en pleine nature. Prises généreuses sur calcaire provençal parmi les cistes et chênes kermès.'),
  ('Chateauvert', 'La Traversée du Var', '7a+', 'Boulder', 'Longue traversée engagée sur le gros bloc principal. Enchaînement de mouvements techniques et athlétiques avec peu de repos. La pièce maîtresse du site.'),
  ('Forêt de Rambouillet', 'Le Circuit Orange', '4c', 'Boulder', 'Circuit balisé pour grimpeurs débutants et intermédiaires. Blocs de grès ronds et polis dans une belle forêt. Idéal pour une sortie dominicale en famille.'),
  ('Forêt de Rambouillet', 'La Dalle de Rambouillet', '6a', 'Boulder', 'Problème classique sur dalle de grès caractéristique. Friction et équilibre au programme sur ce bloc iconique de la forêt. Moins fréquenté que Fontainebleau.'),
  ('Climb Up Lyon', 'Débutant Bleu', '4a', 'Voie', 'Voie d''initiation parfaitement adaptée pour les premiers pas en salle. Prises colorées généreuses, inclinaison modérée. Encadrée par des moniteurs diplômés.'),
  ('Climb Up Lyon', 'Le Toit Lyonnais', '7a', 'Voie', 'Voie sur le grand toit de la salle, inspiration alpine. Mouvements de gainage intenses sur prises de résine qualité. Un challenge pour les habitués de la salle.'),
  ('Climb Up Lyon', 'Bloc System 6c', '6c', 'Boulder', 'Problème de bloc moderne dans la zone dédiée. Mouvements coordonnés et dynamiques sur prises volumétriques. Le style contemporain du bloc indoor à Lyon.'),
  ('Block''Out Paris Porte de la Chapelle', 'La Parisienne', '5b', 'Boulder', 'Problème accessible pour les grimpeurs urbains. Mouvements fluides sur prises accueillantes. La voie parfaite pour commencer une session au Block''Out.'),
  ('Block''Out Paris Porte de la Chapelle', 'Voltage Paris', '7b+', 'Boulder', 'Problème de compétition tracé par les routesetters professionnels. Mouvements dynamiques explosifs sur volumes. Réservé aux grimpeurs de niveau avancé.'),
  ('Vertical''Art Nantes', 'Initiation Nantes', '4b', 'Voie', 'Voie parfaite pour découvrir l''escalade en salle. Structure accueillante, prises bien définies. Moniteurs disponibles pour les cours débutants.'),
  ('Vertical''Art Nantes', 'L''Estuaire', '6b+', 'Voie', 'Voie intermédiaire inspirée des lignes de la Loire-Atlantique. Mouvements variés mêlant force et technique sur un mur légèrement déversant.'),
  ('Keep Climbing Grenoble', 'La Chartreuse', '6a+', 'Voie', 'Voie tracée en hommage au massif alpin. Mouvements variés simulant les passages en rocher naturel. Bonne préparation pour les sorties alpines en Chartreuse.'),
  ('Keep Climbing Grenoble', 'L''Obiou', '7c+', 'Voie', 'Voie avancée sur le grand dévers de la salle. Mouvements de force sur prises petites, très physique. Pour les grimpeurs visant les 8a en rocher naturel.')
) AS r(site_name, name, grade, style, description) ON s.name = r.site_name
ON CONFLICT DO NOTHING;
