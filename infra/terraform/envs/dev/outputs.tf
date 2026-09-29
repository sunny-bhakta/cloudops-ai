output "aws_region" {
  description = "AWS region"
  value       = data.aws_region.current.region
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = module.networking.internet_gateway_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  value       = module.networking.public_subnet_cidrs
}

output "public_route_table_id" {
  description = "Public route table ID"
  value       = module.networking.public_route_table_id
}

output "ecr_repository_name" {
  description = "ECR repository name"
  value       = module.ecr.repository_name
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.ecr.repository_url
}

output "ecr_repository_arn" {
  description = "ECR repository ARN"
  value       = module.ecr.repository_arn
}

output "groq_api_key_secret_name" {
  description = "Groq API key secret name"
  value       = module.secrets.groq_api_key_secret_name
}

output "groq_api_key_secret_arn" {
  description = "Groq API key secret ARN"
  value       = module.secrets.groq_api_key_secret_arn
}

output "ecs_task_execution_role_arn" {
  description = "ECS task execution role ARN"
  value       = module.iam.ecs_task_execution_role_arn
}

output "ecs_task_execution_role_name" {
  description = "ECS task execution role name"
  value       = module.iam.ecs_task_execution_role_name
}

output "ecs_log_group_name" {
  description = "ECS CloudWatch log group name"
  value       = module.monitoring.ecs_log_group_name
}

output "ecs_log_group_arn" {
  description = "ECS CloudWatch log group ARN"
  value       = module.monitoring.ecs_log_group_arn
}

output "ecs_cluster_id" {
  description = "ECS cluster ID"
  value       = module.ecs.cluster_id
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = module.ecs.cluster_arn
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_task_definition_arn" {
  description = "ECS task definition ARN"
  value       = module.ecs.task_definition_arn
}

output "ecs_task_definition_family" {
  description = "ECS task definition family"
  value       = module.ecs.task_definition_family
}

output "ecs_service_id" {
  description = "ECS service ID"
  value       = module.ecs.service_id
}

output "ecs_service_arn" {
  description = "ECS service ARN"
  value       = module.ecs.service_arn
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs.service_name
}

output "alb_id" {
  description = "Application Load Balancer ID"
  value       = module.alb.alb_id
}

output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = module.alb.alb_arn
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.alb.alb_dns_name
}

output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = module.alb.alb_security_group_id
}

output "ecs_security_group_id" {
  description = "ECS security group ID"
  value       = module.alb.ecs_security_group_id
}

output "target_group_arn" {
  description = "Application target group ARN"
  value       = module.alb.target_group_arn
}

output "target_group_name" {
  description = "Application target group name"
  value       = module.alb.target_group_name
}

output "alb_listener_arn" {
  description = "ALB HTTP listener ARN"
  value       = module.alb.listener_arn
}

output "ecs_cpu_alarm_name" {
  description = "ECS CPU CloudWatch alarm name"
  value       = module.alarms.ecs_cpu_alarm_name
}

output "ecs_memory_alarm_name" {
  description = "ECS memory CloudWatch alarm name"
  value       = module.alarms.ecs_memory_alarm_name
}

output "alb_unhealthy_hosts_alarm_name" {
  description = "ALB unhealthy hosts CloudWatch alarm name"
  value       = module.alarms.alb_unhealthy_hosts_alarm_name
}

output "alb_target_5xx_alarm_name" {
  description = "ALB target 5XX CloudWatch alarm name"
  value       = module.alarms.alb_target_5xx_alarm_name
}