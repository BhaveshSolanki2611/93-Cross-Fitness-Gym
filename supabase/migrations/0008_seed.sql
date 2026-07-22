-- 0008 — Seed content data (idempotent via unique slugs / guards)

-- Branch
insert into public.branches (name, slug, phone, email, address_line1, address_line2, area, city, state, postal_code, lat, lng)
values (
  '93 Cross Fitness Gym & Spa', 'sector-82', '+919990300093', 'info@93crossfitness.com',
  'Gate No-3, Shriram Complex', 'opp. BPTP Park Grandeura, Bhataula Village',
  'Sector 82', 'Faridabad', 'Haryana', '121007', 28.3853, 77.3168
) on conflict (slug) do nothing;

-- Membership plans
insert into public.membership_plans (slug, name, tagline, price_monthly, price_quarterly, price_yearly, features, is_featured, sort_order) values
('starter','Starter','Gym floor access to get you moving',1499,3999,13999,
  '["Full gym floor access","Locker & changing rooms","1 fitness assessment","Access during standard hours"]', false, 1),
('pro','Pro','Unlimited classes + gym — our most popular',2499,6499,22999,
  '["Everything in Starter","Unlimited group classes","CrossFit, HIIT, Zumba, Yoga & more","Monthly progress check-ins","Guest passes (2/month)"]', true, 2),
('elite','Elite','Personal training + spa recovery',4999,13999,49999,
  '["Everything in Pro","8 personal training sessions/mo","Personalised nutrition plan","2 spa recovery sessions/mo","Priority class booking"]', false, 3)
on conflict (slug) do nothing;

-- Trainers
insert into public.trainers (slug, full_name, role_title, specialties, certifications, bio, sort_order) values
('rohit-verma','Rohit Verma','Head Coach · CrossFit','{CrossFit,"Olympic Lifting",Strength}','{"CrossFit Level 2",NSCA-CPT}','Rohit leads our CrossFit programming with 10+ years turning beginners into confident athletes.',1),
('sneha-kapoor','Sneha Kapoor','Yoga & Pilates Lead','{Yoga,Pilates,Mobility}','{RYT-500,"Mat Pilates Certified"}','Sneha blends strength and stillness through mindful practice.',2),
('amit-singh','Amit Singh','Strength & Conditioning','{"Weight Training","Fat Loss","Athletic Performance"}','{ACE-CPT,"Precision Nutrition L1"}','Amit builds no-nonsense strength programs and holds you accountable.',3),
('pooja-nair','Pooja Nair','Group Fitness · Zumba & Dance','{Zumba,"Dance Fitness",Aerobics}','{"Zumba Licensed","Group Fitness Certified"}','Pooja''s classes are the most fun 45 minutes of your day.',4),
('karan-mehta','Karan Mehta','Personal Trainer · HIIT','{HIIT,"Personal Training",Cycling}','{ISSA-CPT,"Spinning Certified"}','Karan specialises in time-efficient fat loss for busy professionals.',5),
('divya-rao','Divya Rao','Sports Nutritionist','{Nutrition,"Weight Management",Wellness}','{"MSc Dietetics","Sports Nutrition Certified"}','Divya designs sustainable, India-friendly nutrition plans.',6)
on conflict (slug) do nothing;

-- Classes (types)
insert into public.classes (slug, name, service_slug, default_capacity) values
('crossfit','CrossFit','crossfit',18),
('hiit','HIIT','hiit',24),
('weight-training','Weight Training','weight-training',30),
('zumba','Zumba','zumba',30),
('yoga','Yoga','yoga',20),
('pilates','Pilates','pilates',16),
('aerobics','Aerobics','aerobics',24),
('dance-fitness','Dance Fitness','dance-fitness',24),
('cycling','Cycling','cycling',20)
on conflict (slug) do nothing;

-- Weekly schedule (looks up class + trainer + branch by natural keys)
insert into public.class_schedule (class_id, trainer_id, branch_id, title, service_slug, day_of_week, start_time, end_time, capacity, intensity)
select c.id, t.id, b.id, s.title, s.service_slug, s.dow, s.st::time, s.et::time, s.cap, s.intensity
from (values
  ('crossfit','rohit-verma','CrossFit WOD','crossfit',1,'06:00','07:00',18,'High'),
  ('hiit','karan-mehta','HIIT Burn','hiit',1,'07:30','08:15',24,'High'),
  ('yoga','sneha-kapoor','Power Yoga','yoga',1,'18:00','19:00',20,'Medium'),
  ('zumba','pooja-nair','Zumba','zumba',1,'19:15','20:00',30,'Medium'),
  ('weight-training','amit-singh','Strength Foundations','weight-training',2,'06:00','07:00',30,'Medium'),
  ('cycling','karan-mehta','Spin Cycle','cycling',2,'07:30','08:15',20,'High'),
  ('aerobics','pooja-nair','Aerobics','aerobics',2,'18:00','18:45',24,'Medium'),
  ('pilates','sneha-kapoor','Pilates Core','pilates',2,'19:00','20:00',16,'Low'),
  ('crossfit','rohit-verma','CrossFit WOD','crossfit',3,'06:00','07:00',18,'High'),
  ('hiit','karan-mehta','HIIT Express','hiit',3,'18:00','18:45',24,'High'),
  ('dance-fitness','pooja-nair','Dance Fitness','dance-fitness',3,'19:00','20:00',24,'Medium'),
  ('weight-training','rohit-verma','Olympic Lifting','weight-training',4,'06:00','07:00',30,'High'),
  ('yoga','sneha-kapoor','Vinyasa Flow','yoga',4,'07:30','08:15',20,'Medium'),
  ('zumba','pooja-nair','Zumba','zumba',4,'18:30','19:15',30,'Medium'),
  ('crossfit','rohit-verma','CrossFit WOD','crossfit',5,'06:00','07:00',18,'High'),
  ('hiit','karan-mehta','HIIT Burn','hiit',5,'18:00','18:45',24,'High'),
  ('yoga','sneha-kapoor','Power Yoga','yoga',5,'19:00','20:00',20,'Medium'),
  ('crossfit','amit-singh','Weekend Warrior CrossFit','crossfit',6,'08:00','09:00',18,'High'),
  ('zumba','pooja-nair','Community Zumba','zumba',6,'10:00','11:00',30,'Medium'),
  ('yoga','sneha-kapoor','Recovery Yoga','yoga',6,'17:00','18:00',20,'Low'),
  ('weight-training','amit-singh','Open Gym + Mobility','weight-training',0,'09:00','10:00',30,'Low')
) as s(class_slug, trainer_slug, title, service_slug, dow, st, et, cap, intensity)
join public.classes c on c.slug = s.class_slug
join public.trainers t on t.slug = s.trainer_slug
cross join (select id from public.branches where slug='sector-82' limit 1) b
where not exists (
  select 1 from public.class_schedule x
  where x.title = s.title and x.day_of_week = s.dow and x.start_time = s.st::time
);

-- Testimonials (guarded: table has no natural unique key)
insert into public.testimonials (name, role, quote, rating, sort_order)
select * from (values
('Priya S.','Member · 1 year','The trainers are genuinely certified and so motivating. They corrected my form from day one and I''ve never felt stronger.',5,1),
('Rahul M.','CrossFit member','Cleanest gym in Sector 82 by far. Equipment is always well maintained and the CrossFit community keeps me showing up.',5,2),
('Aisha K.','Zumba & Yoga','Love the variety of classes — Zumba, yoga, aerobics, there''s always something. The instructors bring so much energy.',5,3),
('Vikram T.','Member · 8 months','Reception staff are super helpful and the whole place feels premium. Honestly great value for the money.',5,4),
('Neha R.','Personal training','My personal trainer built a plan around my goals and the nutrition guidance made all the difference. Down 9 kg!',5,5),
('Arjun P.','Weight training','Spacious strength floor, great machines, and the spa afterwards is the perfect recovery. Highly recommend.',5,6)
) as v(name, role, quote, rating, sort_order)
where not exists (select 1 from public.testimonials x where x.name = v.name and x.quote = v.quote);

-- Blog posts
insert into public.blog_posts (slug, title, excerpt, category, author, body) values
('best-gym-in-sector-82-faridabad','How to Choose the Best Gym in Sector 82, Faridabad','Equipment, coaching, cleanliness and community — the five things that actually matter when picking a gym near you.','Guides','93 Cross Fitness Team','Choosing a gym is one of the most important decisions for your health.'),
('crossfit-vs-hiit','CrossFit vs HIIT: Which One Is Right for You?','Both burn fat and build fitness fast — but they''re not the same.','Training','Rohit Verma','CrossFit and HIIT are two of the most effective ways to get fit fast.'),
('nutrition-basics-for-fat-loss','Nutrition Basics for Fat Loss (That Actually Work in India)','Forget crash diets. Sustainable fat loss comes down to a few simple principles.','Nutrition','Divya Rao','You can''t out-train a bad diet.')
on conflict (slug) do nothing;
