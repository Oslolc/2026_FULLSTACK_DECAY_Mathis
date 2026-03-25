INSERT INTO climbing_routes (site_id, name, grade, style, description)
SELECT s.id, r.name, r.grade, r.style, r.description
FROM sites s
JOIN (VALUES
  ('Calanques de Marseille','La Directe des Calanques','6a','Voie','Voie classique en face sud avec vue imprenable sur la mer. Calcaire blanc patiné, mouvements dalles et réglettes. Incontournable pour tout grimpeur visitant Marseille.'),
  ('Calanques de Marseille','Voie des Goélands','7a+','Voie','Voie athlétique en dévers avec des mouvements dynamiques. Une des plus belles lignes des Calanques.'),
  ('Calanques de Marseille','Initiation Calanques','5b','Voie','Idéale pour découvrir l''escalade en falaise naturelle. Voie bien équipée sur calcaire solide.'),
  ('Gorges du Tarn','La Rivière Verte','6c','Voie','Longue voie en balcon au-dessus de la rivière. Calcaire gris très varié avec passages en dalle et en dévers.'),
  ('Gorges du Tarn','Le Sauvage','7b','Voie','Voie engagée sur le grand toit du secteur principal. Réservée aux grimpeurs expérimentés.'),
  ('Gorges du Tarn','Premières Armes','5a','Voie','Voie d''initiation idéale pour les familles. Bien équipée, avec des prises généreuses.'),
  ('Buoux','La Rose et le Vampire','7c','Voie','Voie mythique des années 80. Réglettes tranchantes et enchaînements précis sur calcaire compact.'),
  ('Buoux','Rêve de Papillon','8a','Voie','L''une des voies les plus dures de Buoux. Mouvements très techniques en dalle sur des prises minuscules.'),
  ('Buoux','Les Dalles Grises','5c','Voie','Classique du site accessible aux grimpeurs intermédiaires. Belle dalle grise avec friction et équilibre.'),
  ('Céüse','Biographie','9a+','Voie','L''une des voies les plus célèbres au monde. Répétée par les meilleurs grimpeurs de la planète.'),
  ('Céüse','Le Privilège du Serpent','7a','Voie','Voie accessible parmi les classiques de Céüse. Beau calcaire sculpté, mouvements fluides et variés.'),
  ('Céüse','Berlin','8b+','Voie','Voie de référence mondiale répétée par les plus grands champions.'),
  ('Le Saussois','La Directe','6a+','Voie','Voie historique en face principale du Saussois. Beau calcaire gris, ambiance raide.'),
  ('Le Saussois','Le Dièdre Jaune','5a','Voie','Classique accueillante pour les grimpeurs débutants. Dièdre bien pris avec de bonnes prises.'),
  ('Presles','La Grande Voie','6b','Voie','Grande voie en plusieurs longueurs avec une belle exposition. Vue magnifique sur les gorges de la Bourne.'),
  ('Presles','Le Mur Jaune','7a+','Voie','Voie athlétique sur le secteur le plus raide de Presles. Finition en dalle délicate.'),
  ('Orpierre','Le Versant Sud','5b','Voie','Voie familiale très ensoleillée sur le versant principal. Calcaire solide et bien équipé.'),
  ('Orpierre','La Voie des Chamois','7b+','Voie','Voie engagée sur le secteur haut du village. Vue imprenable sur le village médiéval.'),
  ('Saint-Guilhem-le-Désert','Le Chemin des Pèlerins','6a','Voie','Voie classique du secteur principal. Beau calcaire orange avec des prises variées.'),
  ('Saint-Guilhem-le-Désert','La Gorge Sacrée','7c','Voie','Voie dure et technique dans le secteur encaissé. Mouvements de gainage sur toit avec finition sur dalle.'),
  ('Buis-les-Baronnies','La Voie Provençale','5c','Voie','Voie accessible dans le secteur principal. Vue sur le village et les champs de lavande.'),
  ('Buis-les-Baronnies','La Crête Solaire','6c+','Voie','Voie technique sur calcaire compact très ensoleillé. Passages en dévers exigeants.'),
  ('Targassonne','Le Bloc du Plateau','6b','Boulder','Problème classique sur le bloc principal du plateau. Départ bas sur prises fines, sortie en force.'),
  ('Targassonne','La Fissure Granitique','7a','Boulder','Beau problème de technique dans une fissure de granit. Style très différent du calcaire.'),
  ('Targassonne','L''Arête du Vent','5b','Boulder','Problème d''initiation sur une belle arête de granit. Idéal pour découvrir le bloc en granit.'),
  ('Annot','Le Grès Doré','6c','Boulder','Problème sur une dalle de grès aux teintes dorées. Friction maximale requise.'),
  ('Annot','La Trouée','7b','Boulder','Traversée athlétique sur un bloc sculpté par l''érosion. Mouvements dynamiques et coordination nécessaires.'),
  ('Chateauvert','Le Bloc Provençal','5a','Boulder','Problème d''initiation idéal pour découvrir le bloc en pleine nature. Prises généreuses.'),
  ('Chateauvert','La Traversée du Var','7a+','Boulder','Longue traversée engagée sur le gros bloc principal. La pièce maîtresse du site.'),
  ('Forêt de Rambouillet','Le Circuit Orange','4c','Boulder','Circuit balisé pour grimpeurs débutants et intermédiaires. Idéal pour une sortie en famille.'),
  ('Forêt de Rambouillet','La Dalle de Rambouillet','6a','Boulder','Problème classique sur dalle de grès. Moins fréquenté que Fontainebleau.'),
  ('Climb Up Lyon','Débutant Bleu','4a','Voie','Voie d''initiation adaptée pour les premiers pas en salle. Prises colorées généreuses.'),
  ('Climb Up Lyon','Le Toit Lyonnais','7a','Voie','Voie sur le grand toit de la salle. Mouvements de gainage intenses.'),
  ('Climb Up Lyon','Bloc System 6c','6c','Boulder','Problème de bloc moderne dans la zone dédiée. Mouvements coordonnés et dynamiques.'),
  ('Block''Out Paris Porte de la Chapelle','La Parisienne','5b','Boulder','Problème accessible pour les grimpeurs urbains. La voie parfaite pour débuter une session.'),
  ('Block''Out Paris Porte de la Chapelle','Voltage Paris','7b+','Boulder','Problème de compétition tracé par les routesetters professionnels. Mouvements explosifs.'),
  ('Vertical''Art Nantes','Initiation Nantes','4b','Voie','Voie parfaite pour découvrir l''escalade en salle. Structure accueillante, prises bien définies.'),
  ('Vertical''Art Nantes','L''Estuaire','6b+','Voie','Voie intermédiaire inspirée des lignes de la Loire-Atlantique. Mur légèrement déversant.'),
  ('Keep Climbing Grenoble','La Chartreuse','6a+','Voie','Voie tracée en hommage au massif alpin. Bonne préparation pour les sorties alpines.'),
  ('Keep Climbing Grenoble','L''Obiou','7c+','Voie','Voie avancée sur le grand dévers de la salle. Pour les grimpeurs visant les 8a en rocher naturel.')
) AS r(site_name, name, grade, style, description) ON s.name = r.site_name
ON CONFLICT DO NOTHING;

SELECT COUNT(*) as total_routes FROM climbing_routes;
