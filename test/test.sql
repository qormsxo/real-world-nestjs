-- Profile 데이터 삽입
INSERT INTO profile (username, bio, image, userId)
VALUES 
  ('john_doe', 'This is John\'s bio', 'https://example.com/john.jpg', 1),
  ('jane_doe', 'This is Jane\'s bio', 'https://example.com/jane.jpg', 2);

-- User 데이터 삽입
INSERT INTO user (email, password)
VALUES 
  ('john.doe@example.com', 'password123'),
  ('jane.doe@example.com', 'password456');

-- Follow 데이터 삽입
INSERT INTO follow (followerId, followingId)
VALUES
  (1, 2), -- John follows Jane
  (2, 1); -- Jane follows John

-- Article 데이터 삽입
INSERT INTO article (slug, title, description, body, authorId)
VALUES
  ('how-to-train-your-dragon', 'How to Train Your Dragon', 'A guide to training your dragon.', 'Lorem ipsum...', 1),
  ('how-to-catch-a-unicorn', 'How to Catch a Unicorn', 'A guide to catching a unicorn.', 'Lorem ipsum...', 2);

-- Tag 데이터 삽입
INSERT INTO tag (name)
VALUES
  ('technology'),
  ('life');

-- Article-Tag 관계 데이터 삽입
INSERT INTO article_tags (articleId, tagId)
VALUES
  (1, 1), -- Article 1 is tagged with "technology"
  (2, 2); -- Article 2 is tagged with "life"

-- Comment 데이터 삽입
INSERT INTO comment (body, articleId, userId)
VALUES
  ('Great article!', 1, 2), -- Jane comments on John\'s article
  ('Very helpful!', 2, 1); -- John comments on Jane\'s article

-- Favorite 데이터 삽입
INSERT INTO favorite (userId, articleId)
VALUES
  (1, 1), -- John likes article 1
  (2, 2); -- Jane likes article 2
