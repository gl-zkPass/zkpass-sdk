USE control_panel;

DELIMITER //
DROP PROCEDURE IF EXISTS GetActiveApiKeys;
CREATE PROCEDURE GetActiveApiKeys()
BEGIN
    SELECT `key` as `api_key`, `secretKey` as `secret_api_key` FROM ApiKey WHERE `status` = 1;
END //
DELIMITER ;