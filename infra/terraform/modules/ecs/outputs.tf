output "cluster_id" {
  description = "ECS cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "cluster_arn" {
  description = "ECS cluster ARN"
  value       = aws_ecs_cluster.main.arn
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "task_definition_arn" {
  description = "ECS task definition ARN"
  value       = aws_ecs_task_definition.app.arn
}

output "task_definition_family" {
  description = "ECS task definition family"
  value       = aws_ecs_task_definition.app.family
}

output "service_id" {
  description = "ECS service ID"
  value       = aws_ecs_service.app.id
}

output "service_arn" {
  description = "ECS service ARN"
  value       = aws_ecs_service.app.id
}

output "service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.app.name
}