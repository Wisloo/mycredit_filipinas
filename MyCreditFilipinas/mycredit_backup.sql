-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: mycreditfilipinas_database
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary table structure for view `active_loans`
--

DROP TABLE IF EXISTS `active_loans`;
/*!50001 DROP VIEW IF EXISTS `active_loans`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `active_loans` AS SELECT
 1 AS `loan_id`,
  1 AS `user_id`,
  1 AS `loan_type_id`,
  1 AS `loan_purpose_id`,
  1 AS `principal_amt`,
  1 AS `term_months`,
  1 AS `amortization`,
  1 AS `fees`,
  1 AS `profit`,
  1 AS `interest_rate`,
  1 AS `current_balance`,
  1 AS `loan_status`,
  1 AS `processed_by`,
  1 AS `decision_date`,
  1 AS `date_released`,
  1 AS `term_due`,
  1 AS `release_frequency`,
  1 AS `created_at`,
  1 AS `updated_at` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `addresses` (
  `address_id` int(11) NOT NULL AUTO_INCREMENT,
  `building_floor` varchar(255) DEFAULT NULL,
  `lot` varchar(255) DEFAULT NULL,
  `blk` varchar(255) DEFAULT NULL,
  `purok` varchar(255) DEFAULT NULL,
  `barangay` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `full_address_string` varchar(512) DEFAULT NULL,
  `landmarks` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`address_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (5,'n/a','23','23','Elenita Heights','Catalunan Grande','Davao City','23, 23, Elenita Heights, Catalunan Grande, Davao City',NULL,'2026-02-24 14:46:51','2026-02-24 14:46:51');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bank_accounts` (
  `bank_account_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `card_number` varchar(16) DEFAULT NULL,
  `card_expiry_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`bank_account_id`),
  KEY `fk_bank_user` (`user_id`),
  CONSTRAINT `fk_bank_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_accounts`
--

LOCK TABLES `bank_accounts` WRITE;
/*!40000 ALTER TABLE `bank_accounts` DISABLE KEYS */;
INSERT INTO `bank_accounts` VALUES (5,24,'BPI','1234567890','2030-10-16','2026-02-24 14:47:48','2026-02-24 14:47:52');
/*!40000 ALTER TABLE `bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_numbers`
--

DROP TABLE IF EXISTS `contact_numbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_numbers` (
  `contact_number_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `contact_type` enum('Personal','Work','Parent') DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`contact_number_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_contact_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_numbers`
--

LOCK TABLES `contact_numbers` WRITE;
/*!40000 ALTER TABLE `contact_numbers` DISABLE KEYS */;
INSERT INTO `contact_numbers` VALUES (7,24,'0912 345 6789','Personal','2026-02-24 14:44:52',NULL);
/*!40000 ALTER TABLE `contact_numbers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_payments`
--

DROP TABLE IF EXISTS `loan_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loan_payments` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `payment_date` datetime DEFAULT NULL,
  `amount_paid` decimal(15,2) DEFAULT NULL,
  `penalty_amount` decimal(15,2) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('Pending','Verified','Rejected') DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `transaction_id` varchar(50) DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `fk_payment_loan` (`loan_id`),
  KEY `fk_payment_staff` (`verified_by`),
  CONSTRAINT `fk_payment_loan` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`),
  CONSTRAINT `fk_payment_staff` FOREIGN KEY (`verified_by`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_payments`
--

LOCK TABLES `loan_payments` WRITE;
/*!40000 ALTER TABLE `loan_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `loan_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_purposes`
--

DROP TABLE IF EXISTS `loan_purposes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loan_purposes` (
  `loan_purpose_id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_purpose_description` varchar(256) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`loan_purpose_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_purposes`
--

LOCK TABLES `loan_purposes` WRITE;
/*!40000 ALTER TABLE `loan_purposes` DISABLE KEYS */;
INSERT INTO `loan_purposes` VALUES (15,'Others','2026-02-23 18:56:52',NULL);
/*!40000 ALTER TABLE `loan_purposes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_releases`
--

DROP TABLE IF EXISTS `loan_releases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loan_releases` (
  `release_id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `release_date` date DEFAULT NULL,
  `amount_released` decimal(15,2) DEFAULT NULL,
  `bank_account_id` int(11) DEFAULT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `released_by_ceo_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`release_id`),
  KEY `fk_release_loan` (`loan_id`),
  KEY `fk_release_bank` (`bank_account_id`),
  KEY `fk_release_ceo` (`released_by_ceo_id`),
  CONSTRAINT `fk_release_bank` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`bank_account_id`),
  CONSTRAINT `fk_release_ceo` FOREIGN KEY (`released_by_ceo_id`) REFERENCES `staff` (`staff_id`),
  CONSTRAINT `fk_release_loan` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_releases`
--

LOCK TABLES `loan_releases` WRITE;
/*!40000 ALTER TABLE `loan_releases` DISABLE KEYS */;
INSERT INTO `loan_releases` VALUES (2,7,'2026-02-24',25000.00,NULL,'REL-7-MM08NKSR',9,'2026-02-24 14:42:38','2026-02-24 14:42:38');
/*!40000 ALTER TABLE `loan_releases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_schedules`
--

DROP TABLE IF EXISTS `loan_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loan_schedules` (
  `schedule_id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `due_date` date DEFAULT NULL,
  `scheduled_amount` decimal(15,2) DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT NULL,
  `status` enum('Unpaid','Partial','Paid','Overdue') DEFAULT NULL,
  PRIMARY KEY (`schedule_id`),
  KEY `fk_schedule_loan` (`loan_id`),
  CONSTRAINT `fk_schedule_loan` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_schedules`
--

LOCK TABLES `loan_schedules` WRITE;
/*!40000 ALTER TABLE `loan_schedules` DISABLE KEYS */;
INSERT INTO `loan_schedules` VALUES (3,7,'2026-03-11',1331.90,0.00,'Unpaid'),(4,7,'2026-03-26',1331.90,0.00,'Unpaid'),(5,7,'2026-04-11',1331.90,0.00,'Unpaid'),(6,7,'2026-04-26',1331.90,0.00,'Unpaid'),(7,7,'2026-05-11',1331.90,0.00,'Unpaid'),(8,7,'2026-05-26',1331.90,0.00,'Unpaid'),(9,7,'2026-06-11',1331.90,0.00,'Unpaid'),(10,7,'2026-06-26',1331.90,0.00,'Unpaid'),(11,7,'2026-07-11',1331.90,0.00,'Unpaid'),(12,7,'2026-07-26',1331.90,0.00,'Unpaid'),(13,7,'2026-08-10',1331.90,0.00,'Unpaid'),(14,7,'2026-08-26',1331.90,0.00,'Unpaid'),(15,7,'2026-09-10',1331.90,0.00,'Unpaid'),(16,7,'2026-09-25',1331.90,0.00,'Unpaid'),(17,7,'2026-10-10',1331.90,0.00,'Unpaid'),(18,7,'2026-10-26',1331.90,0.00,'Unpaid'),(19,7,'2026-11-10',1331.90,0.00,'Unpaid'),(20,7,'2026-11-25',1331.90,0.00,'Unpaid'),(21,7,'2026-12-10',1331.90,0.00,'Unpaid'),(22,7,'2026-12-25',1331.90,0.00,'Unpaid'),(23,7,'2027-01-10',1331.90,0.00,'Unpaid'),(24,7,'2027-01-25',1331.90,0.00,'Unpaid'),(25,7,'2027-02-09',1331.90,0.00,'Unpaid'),(26,7,'2027-02-24',1331.90,0.00,'Unpaid');
/*!40000 ALTER TABLE `loan_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loan_types`
--

DROP TABLE IF EXISTS `loan_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loan_types` (
  `loan_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_type_name` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`loan_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loan_types`
--

LOCK TABLES `loan_types` WRITE;
/*!40000 ALTER TABLE `loan_types` DISABLE KEYS */;
INSERT INTO `loan_types` VALUES (7,'Personal Loan','2026-02-23 18:17:52',NULL),(8,'Salary Loan','2026-02-23 18:17:52',NULL),(9,'Emergency Loan','2026-02-23 18:41:30',NULL),(10,'Business Loan','2026-02-23 18:41:30',NULL),(11,'Educational Loan','2026-02-23 18:41:30',NULL);
/*!40000 ALTER TABLE `loan_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loans` (
  `loan_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `loan_type_id` int(11) NOT NULL,
  `loan_purpose_id` int(11) NOT NULL,
  `principal_amt` decimal(15,2) DEFAULT NULL,
  `term_months` int(11) DEFAULT NULL,
  `amortization` decimal(15,2) DEFAULT NULL,
  `fees` decimal(15,2) DEFAULT NULL,
  `profit` decimal(15,2) DEFAULT NULL,
  `interest_rate` decimal(15,2) DEFAULT 0.04,
  `current_balance` decimal(15,2) DEFAULT NULL,
  `loan_status` enum('Pending','Approved','Denied','Active','Paid','Defaulted','Frozen') NOT NULL DEFAULT 'Pending',
  `processed_by` int(11) DEFAULT NULL,
  `decision_date` datetime DEFAULT NULL,
  `date_released` datetime DEFAULT NULL,
  `term_due` datetime DEFAULT NULL,
  `release_frequency` enum('bi-monthly','monthly') DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  PRIMARY KEY (`loan_id`),
  KEY `fk_loans_user` (`user_id`),
  KEY `fk_loans_type` (`loan_type_id`),
  KEY `fk_loans_purpose` (`loan_purpose_id`),
  KEY `fk_loans_staff` (`processed_by`),
  CONSTRAINT `fk_loans_purpose` FOREIGN KEY (`loan_purpose_id`) REFERENCES `loan_purposes` (`loan_purpose_id`),
  CONSTRAINT `fk_loans_staff` FOREIGN KEY (`processed_by`) REFERENCES `staff` (`staff_id`),
  CONSTRAINT `fk_loans_type` FOREIGN KEY (`loan_type_id`) REFERENCES `loan_types` (`loan_type_id`),
  CONSTRAINT `fk_loans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Loans issued to customers of MyCredit';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
INSERT INTO `loans` VALUES (7,24,7,15,25000.00,12,2663.80,500.00,6965.65,0.04,25000.00,'Active',9,'2026-02-24 14:42:38','2026-02-24 14:42:38','2027-02-24 14:42:38','bi-monthly','2026-02-23 19:09:45','2026-02-24 19:36:08','Bike Expense');
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `payment_details`
--

DROP TABLE IF EXISTS `payment_details`;
/*!50001 DROP VIEW IF EXISTS `payment_details`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `payment_details` AS SELECT
 1 AS `payment_id`,
  1 AS `loan_id`,
  1 AS `payment_date`,
  1 AS `amount_paid`,
  1 AS `penalty_amount`,
  1 AS `payment_method`,
  1 AS `payment_status`,
  1 AS `verified_by`,
  1 AS `transaction_id`,
  1 AS `attachment_url`,
  1 AS `remarks`,
  1 AS `created_at`,
  1 AS `updated_at`,
  1 AS `first_name`,
  1 AS `last_name` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `references`
--

DROP TABLE IF EXISTS `references`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `references` (
  `reference_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `reference_type` enum('relative','friend','work friend') DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `address` varchar(256) DEFAULT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `verification_notes` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`reference_id`),
  KEY `fk_ref_user` (`user_id`),
  KEY `fk_ref_staff` (`verified_by`),
  CONSTRAINT `fk_ref_staff` FOREIGN KEY (`verified_by`) REFERENCES `staff` (`staff_id`),
  CONSTRAINT `fk_ref_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `references`
--

LOCK TABLES `references` WRITE;
/*!40000 ALTER TABLE `references` DISABLE KEYS */;
INSERT INTO `references` VALUES (1,24,'relative','Maylingus Baylingus','Blk 23 Lot 3 Elenita Heights Phase 1 Davao City','0956 789 2042',NULL,NULL,'2026-02-24 14:48:20',NULL);
/*!40000 ALTER TABLE `references` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reject`
--

DROP TABLE IF EXISTS `reject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reject` (
  `loan_id` int(11) NOT NULL,
  `date_rejected` datetime DEFAULT NULL,
  `rejected_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`loan_id`),
  CONSTRAINT `fk_reject_loan` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reject`
--

LOCK TABLES `reject` WRITE;
/*!40000 ALTER TABLE `reject` DISABLE KEYS */;
INSERT INTO `reject` VALUES (6,'2026-02-24 15:20:14','Application denied by staff');
/*!40000 ALTER TABLE `reject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `staff` (
  `staff_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) DEFAULT NULL,
  `role` enum('Admin','Approver') DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `is_inactive` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (9,'Admin User','Admin','admin','$2b$12$wxdygsipvvLh1DzUZN4oXuis4K.i29D58j.eAPtzgc4EBrH2ysDLS',0,'2026-02-23 18:17:52',NULL),(10,'Approver One','Approver','approver1','$2b$12$wxdygsipvvLh1DzUZN4oXuis4K.i29D58j.eAPtzgc4EBrH2ysDLS',0,'2026-02-23 18:17:52',NULL);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_addresses`
--

DROP TABLE IF EXISTS `user_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_addresses` (
  `user_address_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `address_id` int(11) NOT NULL,
  `address_type` enum('birth_place','present','other') DEFAULT NULL,
  `residence_type` enum('Owned(personal)','Owned but living with parents/relatives','Rented','Rented but living with parents/relatives') DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `moved_out_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_address_id`),
  KEY `user_id` (`user_id`),
  KEY `address_id` (`address_id`),
  CONSTRAINT `fk_ua_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`),
  CONSTRAINT `fk_ua_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_addresses`
--

LOCK TABLES `user_addresses` WRITE;
/*!40000 ALTER TABLE `user_addresses` DISABLE KEYS */;
INSERT INTO `user_addresses` VALUES (4,24,5,'present','Owned(personal)',0,1,NULL,'2026-02-24 14:46:51','2026-02-24 14:46:51');
/*!40000 ALTER TABLE `user_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `user_loan_summary`
--

DROP TABLE IF EXISTS `user_loan_summary`;
/*!50001 DROP VIEW IF EXISTS `user_loan_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `user_loan_summary` AS SELECT
 1 AS `user_id`,
  1 AS `first_name`,
  1 AS `total_loans` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_profiles` (
  `user_profile_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `employer_agency` varchar(100) DEFAULT NULL,
  `previous_employer` varchar(100) DEFAULT NULL,
  `educational_attainment` varchar(255) DEFAULT NULL,
  `income` decimal(15,2) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_profile_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (5,24,'Bike Maintenance Repairer','Chingus','Bingus','High School',15000.00,'2026-02-24 14:47:20','2026-02-24 14:47:20');
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `suffix` varchar(20) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `email_address` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `is_inactive` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email_address` (`email_address`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (24,'John','Santo','Tikoy',NULL,'Male','2006-06-13',NULL,'test@gmail.com','$2b$12$dKdBBkL/7h2OgQbP1EnwOe2jozQ.ol/NDtJ2qn1GZ.E1O0PVdhoOa',0,'2026-02-23 18:26:11','2026-02-24 19:18:48');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `active_loans`
--

/*!50001 DROP VIEW IF EXISTS `active_loans`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `active_loans` AS select `loans`.`loan_id` AS `loan_id`,`loans`.`user_id` AS `user_id`,`loans`.`loan_type_id` AS `loan_type_id`,`loans`.`loan_purpose_id` AS `loan_purpose_id`,`loans`.`principal_amt` AS `principal_amt`,`loans`.`term_months` AS `term_months`,`loans`.`amortization` AS `amortization`,`loans`.`fees` AS `fees`,`loans`.`profit` AS `profit`,`loans`.`interest_rate` AS `interest_rate`,`loans`.`current_balance` AS `current_balance`,`loans`.`loan_status` AS `loan_status`,`loans`.`processed_by` AS `processed_by`,`loans`.`decision_date` AS `decision_date`,`loans`.`date_released` AS `date_released`,`loans`.`term_due` AS `term_due`,`loans`.`release_frequency` AS `release_frequency`,`loans`.`created_at` AS `created_at`,`loans`.`updated_at` AS `updated_at` from `loans` where `loans`.`loan_status` = 'Active' */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `payment_details`
--

/*!50001 DROP VIEW IF EXISTS `payment_details`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `payment_details` AS select `lp`.`payment_id` AS `payment_id`,`lp`.`loan_id` AS `loan_id`,`lp`.`payment_date` AS `payment_date`,`lp`.`amount_paid` AS `amount_paid`,`lp`.`penalty_amount` AS `penalty_amount`,`lp`.`payment_method` AS `payment_method`,`lp`.`payment_status` AS `payment_status`,`lp`.`verified_by` AS `verified_by`,`lp`.`transaction_id` AS `transaction_id`,`lp`.`attachment_url` AS `attachment_url`,`lp`.`remarks` AS `remarks`,`lp`.`created_at` AS `created_at`,`lp`.`updated_at` AS `updated_at`,`u`.`first_name` AS `first_name`,`u`.`last_name` AS `last_name` from ((`loan_payments` `lp` join `loans` `l` on(`lp`.`loan_id` = `l`.`loan_id`)) join `users` `u` on(`l`.`user_id` = `u`.`user_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_loan_summary`
--

/*!50001 DROP VIEW IF EXISTS `user_loan_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_loan_summary` AS select `u`.`user_id` AS `user_id`,`u`.`first_name` AS `first_name`,count(`l`.`loan_id`) AS `total_loans` from (`users` `u` left join `loans` `l` on(`u`.`user_id` = `l`.`user_id`)) group by `u`.`user_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-05 20:19:52
