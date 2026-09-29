output "ecs_cpu_alarm_name" {
  description = "ECS CPU alarm name"
  value       = aws_cloudwatch_metric_alarm.ecs_cpu_high.alarm_name
}

output "ecs_memory_alarm_name" {
  description = "ECS memory alarm name"
  value       = aws_cloudwatch_metric_alarm.ecs_memory_high.alarm_name
}

output "alb_unhealthy_hosts_alarm_name" {
  description = "ALB unhealthy hosts alarm name"
  value       = aws_cloudwatch_metric_alarm.alb_unhealthy_hosts.alarm_name
}

output "alb_target_5xx_alarm_name" {
  description = "ALB target 5XX alarm name"
  value       = aws_cloudwatch_metric_alarm.alb_target_5xx.alarm_name
}