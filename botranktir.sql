SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `channel` varchar(20) NOT NULL,
  `message` varchar(20) NOT NULL,
  `emoji` varchar(20) NOT NULL,
  `role` varchar(20) NOT NULL,
  `guild` varchar(20) NOT NULL,
  `emoji_raw` varchar(128) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;
