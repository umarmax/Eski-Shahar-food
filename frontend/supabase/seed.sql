-- Seed products data
INSERT INTO products (name, name_uz, name_ru, name_en, description_uz, description_ru, description_en, price, category, is_vegetarian, is_spicy, cook_time_minutes, calories) VALUES
-- Plov
('Palov Toshkent', 'Toshkent palovi', 'Плов Ташкентский', 'Tashkent Plov', 'An''anaviy o''zbek palovi qo''y go''shti, sabzi va guruch bilan', 'Традиционный узбекский плов с бараниной, морковью и рисом', 'Traditional Uzbek plov with lamb, carrots, and rice', 45000, 'plov', false, false, 25, 650),
('Palov Samarqand', 'Samarqand palovi', 'Плов Самаркандский', 'Samarkand Plov', 'Samarqand uslubidagi palov no''xat va behi bilan', 'Самаркандский плов с нутом и айвой', 'Samarkand style plov with chickpeas and quince', 50000, 'plov', false, false, 30, 700),

-- Kebab
('Shashlik', 'Qo''y go''shti shashlik', 'Шашлык из баранины', 'Lamb Shashlik', 'Piyoz bilan qo''y go''shti shashlik', 'Шашлык из баранины с луком', 'Grilled lamb skewers with onions', 35000, 'kebab', false, false, 20, 450),
('Lyulya Kebab', 'Lyulya kabob', 'Люля-кебаб', 'Lyulya Kebab', 'Ziravorlar bilan maydalangan qo''y go''shti kabobi', 'Кебаб из рубленой баранины со специями', 'Minced lamb kebab with spices', 32000, 'kebab', false, true, 15, 380),

-- Soups
('Lagman', 'Lag''mon', 'Лагман', 'Lagman', 'Sabzavotlar va go''sht bilan qo''lda tortilgan noodle sho''rva', 'Суп с домашней лапшой, овощами и мясом', 'Hand-pulled noodle soup with vegetables and meat', 38000, 'soups', false, false, 20, 420),
('Shurpa', 'Sho''rva', 'Шурпа', 'Shurpa', 'Kartoshka va sabzavotlar bilan boy qo''y go''shti sho''rvasi', 'Наваристый суп из баранины с картофелем и овощами', 'Rich lamb soup with potatoes and vegetables', 35000, 'soups', false, false, 25, 380),

-- Main dishes
('Manti', 'Manti', 'Манты', 'Manti', 'Qo''y go''shti va piyoz bilan bug''langan chuchvara', 'Паровые пельмени с бараниной и луком', 'Steamed dumplings with lamb and onion', 40000, 'main', false, false, 30, 520),
('Chuchvara', 'Chuchvara', 'Чучвара', 'Chuchvara', 'Sho''rvada kichik chuchvara', 'Маленькие пельмени в бульоне', 'Small dumplings in broth', 32000, 'main', false, false, 20, 380),

-- Salads
('Achichuk', 'Achichuk', 'Ачичук', 'Achichuk', 'Yangi pomidor va piyoz salati', 'Свежий салат из помидоров и лука', 'Fresh tomato and onion salad', 15000, 'salads', true, false, 5, 80),
('Shakarob', 'Shakarob', 'Шакароб', 'Shakarob', 'Qatiq bilan pomidor salati', 'Салат из помидоров с йогуртовой заправкой', 'Tomato salad with yogurt dressing', 18000, 'salads', true, false, 5, 120),

-- Bread
('Non', 'Non', 'Лепёшка', 'Uzbek Bread', 'An''anaviy o''zbek noni', 'Традиционная узбекская лепёшка', 'Traditional Uzbek flatbread', 8000, 'bread', true, false, 5, 280),
('Somsa', 'Somsa', 'Самса', 'Samsa', 'Qo''y go''shti bilan pishirilgan somsa', 'Печёная выпечка с начинкой из баранины', 'Baked pastry with lamb filling', 12000, 'bread', false, false, 10, 350),

-- Drinks
('Choy', 'Ko''k choy', 'Зелёный чай', 'Green Tea', 'An''anaviy o''zbek ko''k choyi', 'Традиционный узбекский зелёный чай', 'Traditional Uzbek green tea', 10000, 'drinks', true, false, 5, 0),
('Ayran', 'Ayron', 'Айран', 'Ayran', 'Sovuq qatiq ichimlik', 'Холодный йогуртовый напиток', 'Cold yogurt drink', 12000, 'drinks', true, false, 2, 60),

-- Desserts
('Halva', 'Halvo', 'Халва', 'Halva', 'Kunjutdan tayyorlangan an''anaviy shirinlik', 'Традиционная сладость из кунжута', 'Traditional sweet made from sesame', 15000, 'desserts', true, false, 5, 450),
('Chak-chak', 'Chak-chak', 'Чак-чак', 'Chak-chak', 'Asalda qovurilgan xamir bo''laklari', 'Жареные кусочки теста в мёде', 'Fried dough balls in honey', 18000, 'desserts', true, false, 5, 380);
