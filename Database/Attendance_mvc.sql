-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: attendance_mvc
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendances` (
  `attendance_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `teacher_id` int NOT NULL COMMENT 'Teacher who recorded the attendance',
  `subject_id` int NOT NULL COMMENT 'Subject for which attendance is recorded',
  `attendance_date` date NOT NULL COMMENT 'Date of attendance',
  `session` varchar(20) NOT NULL DEFAULT 'morning' COMMENT 'Session/Period: morning, afternoon, evening, or period_1, period_2, etc.',
  `status` varchar(10) NOT NULL DEFAULT 'P' COMMENT 'P=Present, A=Absent, L=Late, E=Excused',
  `notes` text COMMENT 'Additional notes or reasons',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`attendance_id`),
  KEY `unique_attendance_record` (`student_id`,`attendance_date`,`subject_id`,`session`),
  KEY `idx_attendance_date` (`attendance_date`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_subject_id` (`subject_id`),
  KEY `idx_status` (`status`),
  KEY `idx_date_subject` (`attendance_date`,`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `attendances_ibfk_217` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendances_ibfk_218` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `attendances_ibfk_219` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=399 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendances`
--

LOCK TABLES `attendances` WRITE;
/*!40000 ALTER TABLE `attendances` DISABLE KEYS */;
INSERT INTO `attendances` VALUES (221,2,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(222,2,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(223,2,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(224,3,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(225,3,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(226,3,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(227,4,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(228,4,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(229,4,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(230,5,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(231,5,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(232,5,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(233,8,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(234,8,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(235,8,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(236,11,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(237,11,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(238,11,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(239,14,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(240,14,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(241,14,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(242,15,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(243,15,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(244,15,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(245,16,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(246,16,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(247,16,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(248,17,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(249,17,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(250,17,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(251,18,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(252,18,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(253,18,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(254,19,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(255,19,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(256,19,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(257,22,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(258,22,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(259,22,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(260,26,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(261,26,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(262,26,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(263,27,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(264,27,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(265,27,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(266,29,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(267,29,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(268,29,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(269,30,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(270,30,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(271,30,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(272,31,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(273,31,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(274,31,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(275,32,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(276,32,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(277,32,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(278,33,1,10,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(279,33,1,11,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(280,33,1,12,'2026-03-02','morning','P',NULL,'2026-03-02 15:00:58','2026-03-02 15:00:58'),(281,35,1,10,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(282,35,1,11,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(283,35,1,12,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(284,36,1,10,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(285,36,1,11,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(286,36,1,12,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(287,38,1,10,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(288,38,1,11,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(289,38,1,12,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(290,39,1,10,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(291,39,1,11,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(292,39,1,12,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(293,42,1,10,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(294,42,1,11,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(295,42,1,12,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(296,44,1,10,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(297,44,1,11,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(298,44,1,12,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(299,45,1,10,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(300,45,1,11,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(301,45,1,12,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(302,46,1,10,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(303,46,1,11,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(304,46,1,12,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(305,47,1,10,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(306,47,1,11,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(307,47,1,12,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(311,51,1,10,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(312,51,1,11,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(313,51,1,12,'2026-03-02','morning','A',NULL,'2026-03-02 15:01:20','2026-03-02 15:01:20'),(314,2,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 07:05:04','2026-03-03 07:05:04'),(315,2,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 07:05:04','2026-03-03 07:05:04'),(316,2,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 07:05:04','2026-03-03 07:05:04'),(317,3,1,13,'2026-03-03','morning','A',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(318,4,1,13,'2026-03-03','morning','A',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(319,5,1,13,'2026-03-03','morning','A',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(320,8,1,13,'2026-03-03','morning','A',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(321,11,1,13,'2026-03-03','morning','A',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(322,14,1,13,'2026-03-03','morning','A',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(323,15,1,13,'2026-03-03','morning','A',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(324,16,1,13,'2026-03-03','morning','L',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(325,18,1,13,'2026-03-03','morning','L',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(326,17,1,13,'2026-03-03','morning','L',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(327,19,1,13,'2026-03-03','morning','L',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(328,22,1,13,'2026-03-03','morning','E',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(329,27,1,13,'2026-03-03','morning','E',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(330,26,1,13,'2026-03-03','morning','E',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(331,29,1,13,'2026-03-03','morning','E',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(332,30,1,13,'2026-03-03','morning','E',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(333,32,1,13,'2026-03-03','morning','E',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(334,31,1,13,'2026-03-03','morning','E',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(335,33,1,13,'2026-03-03','morning','A',NULL,'2026-03-03 07:06:27','2026-03-03 07:06:27'),(336,1,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:28:04','2026-03-03 08:28:04'),(337,1,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:33:45','2026-03-03 08:33:45'),(338,1,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:33:45','2026-03-03 08:33:45'),(339,1,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(340,1,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(341,1,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(342,6,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(343,6,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(344,6,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(345,7,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(346,7,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(347,7,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(348,9,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(349,9,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(350,9,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(351,10,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(352,10,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(353,10,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(354,12,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(355,12,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(356,12,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(357,13,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(358,13,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(359,13,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(360,20,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(361,20,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(362,20,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(363,21,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(364,21,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(365,21,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(366,23,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(367,23,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(368,23,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(369,24,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(370,24,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(371,24,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(372,25,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(373,25,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(374,25,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(375,28,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(376,28,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(377,28,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(378,34,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(379,34,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(380,34,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(381,37,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(382,37,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(383,37,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(384,40,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(385,40,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(386,40,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(387,41,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(388,41,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(389,41,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(390,43,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(391,43,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(392,43,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(393,49,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(394,49,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(395,49,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(396,50,1,13,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(397,50,1,14,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21'),(398,50,1,15,'2026-03-03','morning','P',NULL,'2026-03-03 08:34:21','2026-03-03 08:34:21');
/*!40000 ALTER TABLE `attendances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_subjects`
--

DROP TABLE IF EXISTS `class_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_subjects` (
  `class_subject_id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `teacher_id` int DEFAULT NULL,
  `day_of_week` int NOT NULL COMMENT '0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday',
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`class_subject_id`),
  UNIQUE KEY `class_subjects_class_id_subject_id_day_of_week` (`class_id`,`subject_id`,`day_of_week`),
  KEY `subject_id` (`subject_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `class_subjects_ibfk_202` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `class_subjects_ibfk_203` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `class_subjects_ibfk_204` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_subjects`
--

LOCK TABLES `class_subjects` WRITE;
/*!40000 ALTER TABLE `class_subjects` DISABLE KEYS */;
INSERT INTO `class_subjects` VALUES (58,2,11,2,1,'00:00:00','00:00:00','','2026-03-02 14:54:41','2026-03-02 14:54:41'),(59,2,12,1,1,NULL,NULL,NULL,'2026-03-02 14:54:50','2026-03-02 14:54:50'),(60,2,10,3,1,NULL,NULL,NULL,'2026-03-02 14:54:57','2026-03-02 14:54:57'),(61,2,14,5,2,NULL,NULL,NULL,'2026-03-02 14:55:04','2026-03-02 14:55:04'),(62,2,13,4,2,NULL,NULL,NULL,'2026-03-02 14:55:13','2026-03-02 14:55:13'),(63,2,15,8,2,NULL,NULL,NULL,'2026-03-02 14:55:23','2026-03-02 14:55:23'),(64,2,10,3,3,NULL,NULL,NULL,'2026-03-02 14:55:32','2026-03-02 14:55:32'),(65,2,16,6,3,NULL,NULL,NULL,'2026-03-02 14:55:41','2026-03-02 14:55:41'),(66,2,11,2,3,NULL,NULL,NULL,'2026-03-02 14:55:51','2026-03-02 14:55:51'),(67,2,13,4,4,NULL,NULL,NULL,'2026-03-02 14:56:09','2026-03-02 14:56:09'),(68,2,16,6,4,NULL,NULL,NULL,'2026-03-02 14:56:15','2026-03-02 14:56:15'),(69,2,17,7,4,NULL,NULL,NULL,'2026-03-02 14:56:26','2026-03-02 14:56:26'),(70,2,17,7,5,NULL,NULL,NULL,'2026-03-02 14:56:37','2026-03-02 14:56:37'),(71,2,14,5,5,NULL,NULL,NULL,'2026-03-02 14:56:45','2026-03-02 14:56:45'),(72,2,18,9,5,NULL,NULL,NULL,'2026-03-02 14:56:55','2026-03-02 14:56:55'),(73,2,18,9,6,NULL,NULL,NULL,'2026-03-02 14:57:01','2026-03-02 14:57:01'),(74,2,15,8,6,NULL,NULL,NULL,'2026-03-02 14:57:09','2026-03-02 14:57:09'),(75,2,12,1,6,NULL,NULL,NULL,'2026-03-02 14:57:16','2026-03-02 14:57:16'),(76,1,11,2,1,NULL,NULL,NULL,'2026-03-02 14:57:57','2026-03-02 14:57:57'),(77,1,12,1,1,NULL,NULL,NULL,'2026-03-02 14:58:08','2026-03-02 14:58:08'),(78,1,10,3,1,NULL,NULL,NULL,'2026-03-02 14:58:15','2026-03-02 14:58:15'),(79,1,14,5,2,NULL,NULL,NULL,'2026-03-02 14:58:25','2026-03-02 14:58:25'),(80,1,13,4,2,NULL,NULL,NULL,'2026-03-02 14:58:37','2026-03-02 14:58:37'),(81,1,15,8,2,NULL,NULL,NULL,'2026-03-02 14:58:45','2026-03-02 14:58:45'),(82,1,10,3,3,NULL,NULL,NULL,'2026-03-02 14:58:51','2026-03-02 14:58:51'),(83,1,16,6,3,NULL,NULL,NULL,'2026-03-02 14:58:57','2026-03-02 14:58:57'),(84,1,11,2,3,NULL,NULL,NULL,'2026-03-02 14:59:04','2026-03-02 14:59:04'),(85,1,13,4,4,NULL,NULL,NULL,'2026-03-02 14:59:12','2026-03-02 14:59:12'),(86,1,16,6,4,NULL,NULL,NULL,'2026-03-02 14:59:21','2026-03-02 14:59:21'),(87,1,17,7,4,NULL,NULL,NULL,'2026-03-02 14:59:29','2026-03-02 14:59:29'),(88,1,17,7,5,NULL,NULL,NULL,'2026-03-02 14:59:37','2026-03-02 14:59:37'),(89,1,14,5,5,NULL,NULL,NULL,'2026-03-02 14:59:44','2026-03-02 14:59:44'),(90,1,18,9,5,NULL,NULL,NULL,'2026-03-02 14:59:53','2026-03-02 14:59:53'),(91,1,18,9,6,NULL,NULL,NULL,'2026-03-02 14:59:59','2026-03-02 14:59:59'),(92,1,15,8,6,NULL,NULL,NULL,'2026-03-02 15:00:05','2026-03-02 15:00:05'),(93,1,12,1,6,NULL,NULL,NULL,'2026-03-02 15:00:11','2026-03-02 15:00:11');
/*!40000 ALTER TABLE `class_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `class_code` varchar(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`class_id`),
  UNIQUE KEY `class_code` (`class_code`),
  UNIQUE KEY `class_code_2` (`class_code`),
  UNIQUE KEY `class_code_3` (`class_code`),
  UNIQUE KEY `class_code_4` (`class_code`),
  UNIQUE KEY `class_code_5` (`class_code`),
  UNIQUE KEY `class_code_6` (`class_code`),
  UNIQUE KEY `class_code_7` (`class_code`),
  UNIQUE KEY `class_code_8` (`class_code`),
  UNIQUE KEY `class_code_9` (`class_code`),
  UNIQUE KEY `class_code_10` (`class_code`),
  UNIQUE KEY `class_code_11` (`class_code`),
  UNIQUE KEY `class_code_12` (`class_code`),
  UNIQUE KEY `class_code_13` (`class_code`),
  UNIQUE KEY `class_code_14` (`class_code`),
  UNIQUE KEY `class_code_15` (`class_code`),
  UNIQUE KEY `class_code_16` (`class_code`),
  UNIQUE KEY `class_code_17` (`class_code`),
  UNIQUE KEY `class_code_18` (`class_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'SV23','2026-03-02 14:53:15','2026-03-02 14:53:15'),(2,'SV13','2026-03-02 14:53:21','2026-03-02 14:53:21');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `student_name_kh` varchar(100) NOT NULL COMMENT 'Student name in Khmer',
  `student_name_eng` varchar(100) NOT NULL COMMENT 'Student name in English',
  `gender` char(1) DEFAULT NULL COMMENT 'M=Male, F=Female, O=Other',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `student_name_kh` (`student_name_kh`),
  UNIQUE KEY `student_name_eng` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_2` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_2` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_3` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_3` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_4` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_4` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_5` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_5` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_6` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_6` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_7` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_7` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_8` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_8` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_9` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_9` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_10` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_10` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_11` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_11` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_12` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_12` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_13` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_13` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_14` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_14` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_15` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_15` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_16` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_16` (`student_name_eng`),
  UNIQUE KEY `student_name_kh_17` (`student_name_kh`),
  UNIQUE KEY `student_name_eng_17` (`student_name_eng`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,2,'អាន ដាវីដ','Ann David','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(2,1,'ឆាំ ឆាឌី','Chham Chhady','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(3,1,'ឈួន បញ្ញារិទ្ធិ','Chhoun Panharith','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(4,1,'ជឹម សៀវហ្វុង','Choem Seavfong','F','2026-03-02 14:53:37','2026-03-02 14:53:37'),(5,1,'ជួន ច័ន្ទកន្និកា','Choun Chankanika','F','2026-03-02 14:53:37','2026-03-02 14:53:37'),(6,2,'អ៊ាប រិទ្ធា','Eab Rithea','F','2026-03-02 14:53:37','2026-03-02 14:53:37'),(7,2,'អ៊ាន ផាន់ណា','Ean Phanna','F','2026-03-02 14:53:37','2026-03-02 14:53:37'),(8,1,'ឯម រក្សា','Em Raksa','F','2026-03-02 14:53:37','2026-03-02 14:53:37'),(9,2,'ហ៊ាន តូហ៊ា','Hean Tohea','F','2026-03-02 14:53:37','2026-03-02 14:53:37'),(10,2,'ហៀង ឈៀវយ៉ាវ','Heang Chhivyav','F','2026-03-02 14:53:37','2026-03-02 14:53:37'),(11,1,'ហេង ស្រីស','Heng Sreysar','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(12,2,'ហេង វិរៈនរិន្ទ','Heng Viraknorin','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(13,2,'ហុងលី ឡុង','Hongly Long','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(14,1,'ហ៊ុល មករា','Hul Makara','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(15,1,'គា ចំណាន','Kea Chamnan','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(16,1,'កែវ រីតា','Keo Rita','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(17,1,'កុយ សុខហេង','Koy Sokheng','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(18,1,'ឡេង វណ្ណសាន','Leng Vansan','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(19,1,'ឡុង ច័ន្ទរស្មី','Long Chanraksmey','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(20,2,'ឡុង តៃលាប','Long Taileap','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(21,2,'លុយ សិទ្ធិគុណ','Luy Sithikun','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(22,1,'មៀច សុខហៃ','Meach Sokhai','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(23,2,'ម៉េង ប៊ុនខេង','Meng Bunkheng','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(24,2,'ញាន តារាវិសាល','Nhean Daravisal','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(25,2,'ញ៉ូន គង់','Nhoun Kong','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(26,1,'អឿន សំអុន','Oeun Sam Oun','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(27,1,'អ៊ូ ស៊ាវអិញ','Ou Seavinh','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(28,2,'ពេជ អាណាន់','Pech Ahnann','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(29,1,'ភួង ភារិទ្ធិ','Phuong Phearith','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(30,1,'ប៉ោ សុវណ្ណារិទ្ធ','Por Sovannarith','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(31,1,'ព្រំ រតនា','Prum Rathna','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(32,1,'ព្រំ សុធាន','Prum Sothean','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(33,1,'រ៉េត រ៉ូហ្សា','Reth Roza','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(34,2,'សាន់ សុវណ្ណនីតា','Sann Sovannita','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(35,1,'សម័យ រិទ្ធីសែន','Saxmay Rithysen','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(36,1,'សាយ កែវរិទ្ធ','Say Keorith','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(37,2,'ស្តើង ម៉េងទ្រី','Sdeung Mengtry','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(38,1,'ស៊ឹម សឿនសុវណ្ណរិទី្ធ','Soem Soeunsovanrithy','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(39,1,'សំបូរ ទិតមុនី','Sombo Titmuny','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(40,2,'សុភាព ផាន់ណា','Sopheap Phanna','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(41,2,'សួង សុវិសាល','Suong Sokvisal','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(42,1,'តាំង អ៊ួយឆាង','Taing Uoychhang','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(43,2,'ថា ដារ៉ូ','Tha Daro','M','2026-03-02 14:53:37','2026-03-02 14:53:37'),(44,1,'ថន ថេង','Thorn Theng','M','2026-03-02 14:53:38','2026-03-02 14:53:38'),(45,1,'ទិត បញ្ញាបុត្រ','Tith Panhaboth','M','2026-03-02 14:53:38','2026-03-02 14:53:38'),(46,1,'វ៉ា រ៉ាយូ','Va Rayou','M','2026-03-02 14:53:38','2026-03-02 14:53:38'),(47,1,'វ៉ាត ភិរុណ','Vat Phirun','M','2026-03-02 14:53:38','2026-03-02 14:53:38'),(49,2,'យ៉ាំង ស្រីនាថ','Yang Sreyneath','M','2026-03-02 14:53:38','2026-03-02 14:53:38'),(50,2,'យ៉ាត សុខអាន','Yat Sok An','M','2026-03-02 14:53:38','2026-03-02 14:53:38'),(51,1,'ប៊ុន សេងទ្រី','Bun Sengtri','M','2026-03-02 14:53:38','2026-03-02 14:53:38');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `subject_id` int NOT NULL AUTO_INCREMENT,
  `subject_name` varchar(100) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`subject_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (10,'Oracle','Oracle','Oracle','2026-02-24 13:33:27','2026-02-24 13:33:27'),(11,'Sm','Sm','Sm','2026-03-01 08:46:10','2026-03-01 08:46:10'),(12,'2D','2D','2D','2026-03-01 08:46:17','2026-03-01 08:46:17'),(13,'WEB','WEB','WEB','2026-03-01 08:46:24','2026-03-01 08:46:24'),(14,'IS','IS','IS','2026-03-01 08:46:30','2026-03-01 08:46:30'),(15,'JAVA','JAVA','JAVA','2026-03-01 08:46:34','2026-03-01 08:46:34'),(16,'SA','SA','SA','2026-03-01 08:46:44','2026-03-01 08:46:44'),(17,'MIS','MIS','MIS','2026-03-01 08:46:51','2026-03-01 08:46:51'),(18,'NET','NET','NET','2026-03-01 08:46:57','2026-03-01 08:46:57');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `teacher_id` int NOT NULL AUTO_INCREMENT,
  `teacher_name_eng` varchar(100) NOT NULL COMMENT 'Teacher name in English',
  `phone` varchar(20) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`teacher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,'Teacher_2D','099706869','2026-02-12 06:58:11','2026-03-01 08:48:58'),(2,'Teacher_Sm','099706869','2026-02-17 08:28:33','2026-03-01 08:48:48'),(3,'Teacher_Ora','099706869','2026-03-01 08:49:11','2026-03-01 08:49:11'),(4,'Teacher_Web','099706869','2026-03-01 08:49:19','2026-03-01 08:49:19'),(5,'Teacher_IS','099706869','2026-03-01 08:49:26','2026-03-01 08:49:26'),(6,'Teacher_SA','099706869','2026-03-01 08:49:36','2026-03-01 08:49:36'),(7,'Teacher_MIS','099706869','2026-03-01 08:49:43','2026-03-01 08:49:43'),(8,'Teacher_Java','099706869','2026-03-01 08:49:51','2026-03-01 08:49:51'),(9,'Teacher_Net','099706869','2026-03-01 08:50:01','2026-03-01 08:50:01');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','teacher','student') NOT NULL,
  `profile_id` int DEFAULT NULL COMMENT 'Links to student_id or teacher_id based on role',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expire` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `username_3` (`username`),
  UNIQUE KEY `username_4` (`username`),
  UNIQUE KEY `username_5` (`username`),
  UNIQUE KEY `username_6` (`username`),
  UNIQUE KEY `username_7` (`username`),
  UNIQUE KEY `username_8` (`username`),
  UNIQUE KEY `username_9` (`username`),
  UNIQUE KEY `username_10` (`username`),
  UNIQUE KEY `username_11` (`username`),
  UNIQUE KEY `username_12` (`username`),
  UNIQUE KEY `username_13` (`username`),
  UNIQUE KEY `username_14` (`username`),
  UNIQUE KEY `username_15` (`username`),
  UNIQUE KEY `username_16` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (111,'admin','$2b$10$NsQaiApK3Uq24JMXL0jz3OYrQ9nKAVXF0yeuBBrUW/Xe14CAY/l3W','admin',NULL,'2026-02-24 13:31:27','2026-03-02 08:44:49','admin@gmail.com','Admin',NULL,NULL),(112,'bunsengtri_t','$2b$10$IDCvzzrJN7RLdIm8mIeu9un9oaoSeR2OGsS8tdKLmrJ/0BGNf1Scu','teacher',1,'2026-02-24 13:31:27','2026-02-24 13:31:27',NULL,NULL,NULL,NULL),(113,'teachertri_t','$2b$10$IDCvzzrJN7RLdIm8mIeu9un9oaoSeR2OGsS8tdKLmrJ/0BGNf1Scu','teacher',2,'2026-02-24 13:31:27','2026-02-24 13:31:27',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-10 21:39:20
