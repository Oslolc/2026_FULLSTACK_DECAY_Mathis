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
  ('admin', 'admin@verticallog.fr', '$2b$10$5jc3AGfVWqN56OOGyb3dBOyCZDw5FaoRBb7PHRalP2Kk0gHHfu4I2', 'admin')
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
