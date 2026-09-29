data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

resource "aws_default_security_group" "default" {
  vpc_id = aws_vpc.main.id

  ingress = []
  egress  = []

  tags = {
    Name = "${var.project_name}-${var.environment}-default-sg"
  }
}

module "networking" {
  source = "../../modules/networking"

  vpc_id             = aws_vpc.main.id
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  project_name       = var.project_name
  environment        = var.environment
}

module "ecr" {
  source = "../../modules/ecr"

  repository_name = "${var.project_name}-${var.environment}"
}

module "secrets" {
  source = "../../modules/secrets"

  project_name = var.project_name
  environment  = var.environment
}

module "iam" {
  source = "../../modules/iam"

  project_name       = var.project_name
  environment        = var.environment
  ecr_repository_arn = module.ecr.repository_arn
  groq_secret_arn    = module.secrets.groq_api_key_secret_arn
}

module "monitoring" {
  source = "../../modules/monitoring"

  project_name       = var.project_name
  environment        = var.environment
  log_retention_days = 7
}

module "alb" {
  source = "../../modules/alb"

  project_name = var.project_name
  environment  = var.environment

  vpc_id = aws_vpc.main.id

  public_subnet_ids = module.networking.public_subnet_ids
}

module "ecs" {
  source = "../../modules/ecs"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  execution_role_arn = module.iam.ecs_task_execution_role_arn
  ecr_repository_url = module.ecr.repository_url
  groq_secret_arn    = module.secrets.groq_api_key_secret_arn
  log_group_name     = module.monitoring.ecs_log_group_name

  container_image_tag = var.container_image_tag

  public_subnet_ids     = module.networking.public_subnet_ids
  ecs_security_group_id = module.alb.ecs_security_group_id
  target_group_arn      = module.alb.target_group_arn
}

module "alarms" {
  source = "../../modules/alarms"

  project_name = var.project_name
  environment  = var.environment

  ecs_cluster_name = module.ecs.cluster_name
  ecs_service_name = module.ecs.service_name

  alb_arn_suffix          = module.alb.alb_arn_suffix
  target_group_arn_suffix = module.alb.target_group_arn_suffix
}