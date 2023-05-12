CREATE OR ALTER PROCEDURE resetPassword(
@email VARCHAR(200),
@password VARCHAR(200)
)
AS
BEGIN 
 
 UPDATE users SET password=@password
 WHERE email=@email

END
