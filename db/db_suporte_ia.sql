-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_suporte_ia
-- ------------------------------------------------------
-- Server version	8.0.32

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
-- Table structure for table `chamados`
--

DROP TABLE IF EXISTS `chamados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chamados` (
  `id_chamado` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `titulo` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_general_ci,
  `categoria` enum('hardware','software','rede','outros') COLLATE utf8mb4_general_ci DEFAULT 'outros',
  `prioridade` enum('baixa','media','alta') COLLATE utf8mb4_general_ci DEFAULT 'media',
  `status` enum('aberto','em_andamento','fechado') COLLATE utf8mb4_general_ci DEFAULT 'aberto',
  `classificado_por_ia` tinyint(1) DEFAULT '0',
  `tempo_medio_atendimento` time DEFAULT NULL,
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_chamado`),
  KEY `id_usuario` (`id_usuario`),
  KEY `status` (`status`),
  KEY `categoria` (`categoria`),
  KEY `prioridade` (`prioridade`),
  CONSTRAINT `chamados_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chamados`
--

LOCK TABLES `chamados` WRITE;
/*!40000 ALTER TABLE `chamados` DISABLE KEYS */;
INSERT INTO `chamados` VALUES (1,1,'Computador não liga','O computador do setor de contabilidade não está ligando após queda de energia.','hardware','alta','em_andamento',0,NULL,'2025-11-07 21:37:27','2025-11-07 21:37:27'),(2,2,'Erro no sistema de vendas','O sistema de vendas apresenta erro de conexão ao banco de dados.','software','media','em_andamento',1,NULL,'2025-11-07 21:37:27','2025-11-07 21:37:27'),(3,3,'Internet intermitente','A conexão de internet cai frequentemente no escritório principal.','rede','alta','em_andamento',0,NULL,'2025-11-07 21:37:27','2025-11-07 21:37:27'),(4,1,'Solicitação de novo monitor','Solicitado novo monitor para estação de trabalho da recepção.','hardware','baixa','fechado',1,NULL,'2025-11-07 21:37:27','2025-11-07 21:37:27'),(5,2,'Instalação de software de design','Necessário instalar o Adobe Illustrator para equipe de marketing.','software','media','em_andamento',0,NULL,'2025-11-07 21:37:27','2025-11-07 21:37:27'),(6,3,'Problema no roteador','O roteador do segundo andar está travando frequentemente.','rede','media','em_andamento',1,NULL,'2025-11-07 21:37:27','2025-11-07 21:37:27'),(7,1,'Atualização de antivírus','Verificar licença do antivírus e atualizar nas máquinas do setor financeiro.','software','baixa','fechado',0,NULL,'2025-11-07 21:37:27','2025-11-07 21:37:27'),(8,2,'Falha no servidor de arquivos','Os usuários não conseguem acessar o servidor de arquivos interno.','rede','alta','em_andamento',1,NULL,'2025-11-07 21:37:27','2025-11-07 21:37:27'),(9,1,'Problema com meu wifi que nao conecta','Problema com meu wifi que nao conecta','rede','media','em_andamento',1,NULL,'2025-11-07 21:42:57','2025-11-07 21:42:57'),(10,4,'Estou com problemas de conectividade no meu wifi','Estou com problemas de conectividade no meu wifi','rede','media','fechado',1,NULL,'2025-11-07 21:48:37','2025-11-07 21:49:11'),(11,4,'Minha impressora não esta funcionando','Minha impressora não esta funcionando','outros','baixa','em_andamento',1,NULL,'2025-11-07 21:48:56','2025-11-07 21:48:56'),(12,4,'Testando api tudo certo?','Testando api tudo certo?','outros','baixa','fechado',1,NULL,'2025-11-08 12:32:10','2025-11-08 12:32:15');
/*!40000 ALTER TABLE `chamados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interacoes_ia`
--

DROP TABLE IF EXISTS `interacoes_ia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interacoes_ia` (
  `id_interacao` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_chamado` int NOT NULL,
  `remetente` enum('usuario','ia') COLLATE utf8mb4_general_ci NOT NULL,
  `mensagem` text COLLATE utf8mb4_general_ci NOT NULL,
  `data_hora` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_interacao`),
  KEY `id_chamado` (`id_chamado`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `interacoes_ia_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `interacoes_ia_ibfk_2` FOREIGN KEY (`id_chamado`) REFERENCES `chamados` (`id_chamado`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interacoes_ia`
--

LOCK TABLES `interacoes_ia` WRITE;
/*!40000 ALTER TABLE `interacoes_ia` DISABLE KEYS */;
INSERT INTO `interacoes_ia` VALUES (1,1,9,'usuario','Problema com meu wifi que nao conecta','2025-11-07 21:42:59'),(2,1,9,'ia','**Siga estas etapas para tentar resolver o problema de conexão Wi‑Fi:**  \n\n1. **Verifique se o roteador está ligado** – confirme que as luzes indicam funcionamento.  \n2. **Reinicie o roteador** – desligue‑o da tomada, aguarde ≈ 30 segundos e ligue‑o novamente.  \n3. **Confira se o Wi‑Fi está habilitado no seu dispositivo** – nas configurações de rede, certifique‑se de que o rádio Wi‑Fi está ativo.  \n4. **Esqueça a rede e reconecte**  \n   - Nas configurações de Wi‑Fi, selecione a rede problemática e escolha “Esquecer”.  \n   - Procure a rede novamente e digite a senha correta.  \n5. **Teste em outro dispositivo** – se outro smartphone/computador conectar sem problemas, o erro está no seu aparelho; caso contrário, o problema está no roteador ou na linha.  \n\nSe, após esses passos, a conexão ainda não funcionar, considere fazer o **reset do roteador** (segundo o procedimento de reset descrito no contexto) ou entre em contato com a operadora para reconfiguração remota.','2025-11-07 21:42:59'),(3,4,10,'usuario','Estou com problemas de conectividade no meu wifi','2025-11-07 21:48:39'),(4,4,10,'ia','**Vamos tentar resolver a conexão Wi‑Fi seguindo estas etapas:**\n\n1. **Verifique se o roteador está ligado** – confirme que as luzes de energia e internet estão acesas.  \n2. **Reinicie o roteador** – desligue-o da tomada, aguarde ≈ 30 segundos e ligue‑o novamente.  \n3. **Cheque se o Wi‑Fi está habilitado no seu dispositivo** – nas configurações de rede, certifique‑se de que o Wi‑Fi está ativado.  \n4. **Esqueça a rede e reconecte** – nas configurações de Wi‑Fi, “esqueça” a rede problemática, depois procure-a novamente e digite a senha correta.  \n5. **Teste em outro dispositivo** – se outro smartphone, tablet ou computador conseguir se conectar, o problema está no primeiro dispositivo; caso contrário, pode ser o roteador ou a linha da operadora.\n\nSe, após essas etapas, o Wi‑Fi ainda não funcionar, considere **resetar o modem/roteador** (pressionando o botão de reset por 10‑15 s) e refazer as configurações de rede, ou entre em contato com sua operadora para suporte avançado.','2025-11-07 21:48:39'),(5,4,11,'usuario','Minha impressora não esta funcionando','2025-11-07 21:48:58'),(6,4,11,'ia','**Passos para resolver a falha de impressão**\n\n1. **Verifique a alimentação e a conexão**  \n   - Certifique‑se de que a impressora está ligada.  \n   - Confira se o cabo USB está bem conectado ao computador ou se a rede Wi‑Fi está ativa.\n\n2. **Cheque consumíveis**  \n   - Veja se há papel suficiente na bandeja.  \n   - Verifique o nível de tinta ou toner.\n\n3. **Driver da impressora**  \n   - Abra o Gerenciador de Dispositivos (ou as Configurações de Impressoras) e confirme se o driver está instalado.  \n   - Atualize o driver para a versão mais recente disponível no site do fabricante.\n\n4. **Reinicie os equipamentos**  \n   - Desligue a impressora, aguarde alguns segundos e ligue‑a novamente.  \n   - Reinicie o computador.\n\n5. **Teste de impressão**  \n   - No painel de controle da impressora ou nas propriedades da impressora no computador, escolha “Imprimir página de teste”.  \n\n6. **Se ainda não funcionar**  \n   - Desinstale o driver atual (Painel de Controle → Programas) e reinstale-o usando o instalador oficial do fabricante.\n\nExecute esses passos na ordem indicada. Caso algum deles resolva o problema, a impressão deve voltar ao normal. Se, após a reinstalação do driver, a impressora ainda não imprimir, pode ser necessário verificar hardware (cabeça de impressão, sensores) ou entrar em contato com o suporte do fabricante.','2025-11-07 21:48:58'),(7,4,12,'usuario','Testando api tudo certo?','2025-11-08 12:32:11'),(8,4,12,'ia','Não há informações no contexto fornecido sobre teste de APIs. Para que eu possa ajudar, por favor descreva o problema ou a dúvida específica que está encontrando ao testar a API.','2025-11-08 12:32:11');
/*!40000 ALTER TABLE `interacoes_ia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `senha` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_usuario` enum('cliente','tecnico','admin') COLLATE utf8mb4_general_ci NOT NULL,
  `autenticacao_mfa` tinyint(1) DEFAULT '0',
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `ultimo_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `email_2` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'João Silva','joao.silva@empresa.com','senha_ficticio_1','cliente',0,'2025-11-07 21:37:27',NULL),(2,'Maria Oliveira','maria.oliveira@empresa.com','senha_ficticio_2','tecnico',1,'2025-11-07 21:37:27',NULL),(3,'Carlos Souza','carlos.souza@empresa.com','senha_ficticio_3','admin',1,'2025-11-07 21:37:27',NULL),(4,'Guilherme Alves','gui@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$cc7Ze4+xFsJY693b+793rg$4b0qv8T9JGkUfN87oxh0HNHH3MX2IsbIhnrGUSphtdc','cliente',0,'2025-11-08 00:42:37',NULL),(5,'Teste da silva','teste@teste.com','$argon2id$v=19$m=65536,t=3,p=4$EsJYa+1dK4XQ2luLMWbMuQ$pM5BrAHWUlsopzM/VCAvJqL1b6vuwiPWDTkozCfxGmY','cliente',0,'2025-11-08 15:32:47',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-08 12:53:38
