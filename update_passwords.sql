UPDATE users SET password = '$2a$10$Kvl78vMAxhdmQC.CLoW4suNM5DmXsRc6hPH6c9GKcVp919IoNKRJu' WHERE email = 'student@school.com';
UPDATE users SET password = '$2a$10$Kvl78vMAxhdmQC.CLoW4suNM5DmXsRc6hPH6c9GKcVp919IoNKRJu' WHERE email = 'admin@school.com';
UPDATE users SET password = '$2a$10$Kvl78vMAxhdmQC.CLoW4suNM5DmXsRc6hPH6c9GKcVp919IoNKRJu' WHERE email = 'cook@school.com';
SELECT email, password FROM users;
