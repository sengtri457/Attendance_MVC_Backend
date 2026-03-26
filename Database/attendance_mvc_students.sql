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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-10 21:41:52
