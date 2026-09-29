resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name = "${var.project_name}-${var.environment}-ecs-cpu-high"

  alarm_description = "ECS service CPU utilization is above 80%"

  namespace   = "AWS/ECS"
  metric_name = "CPUUtilization"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  statistic           = "Average"
  period              = 60
  evaluation_periods  = 5
  datapoints_to_alarm = 5

  comparison_operator = "GreaterThanThreshold"
  threshold           = 80

  treat_missing_data = "notBreaching"

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-cpu-high"
  }
}

resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  alarm_name = "${var.project_name}-${var.environment}-ecs-memory-high"

  alarm_description = "ECS service memory utilization is above 80%"

  namespace   = "AWS/ECS"
  metric_name = "MemoryUtilization"

  dimensions = {
    ClusterName = var.ecs_cluster_name
    ServiceName = var.ecs_service_name
  }

  statistic           = "Average"
  period              = 60
  evaluation_periods  = 5
  datapoints_to_alarm = 5

  comparison_operator = "GreaterThanThreshold"
  threshold           = 80

  treat_missing_data = "notBreaching"

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-memory-high"
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_unhealthy_hosts" {
  alarm_name = "${var.project_name}-${var.environment}-alb-unhealthy-hosts"

  alarm_description = "ALB target group has unhealthy ECS targets"

  namespace   = "AWS/ApplicationELB"
  metric_name = "UnHealthyHostCount"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }

  statistic           = "Minimum"
  period              = 60
  evaluation_periods  = 2
  datapoints_to_alarm = 2

  comparison_operator = "GreaterThanThreshold"
  threshold           = 0

  treat_missing_data = "notBreaching"

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-unhealthy-hosts"
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_target_5xx" {
  alarm_name = "${var.project_name}-${var.environment}-alb-target-5xx"

  alarm_description = "ALB targets are returning HTTP 5XX responses"

  namespace   = "AWS/ApplicationELB"
  metric_name = "HTTPCode_Target_5XX_Count"

  dimensions = {
    LoadBalancer = var.alb_arn_suffix
    TargetGroup  = var.target_group_arn_suffix
  }

  statistic           = "Sum"
  period              = 60
  evaluation_periods  = 5
  datapoints_to_alarm = 5

  comparison_operator = "GreaterThanThreshold"
  threshold           = 5

  treat_missing_data = "notBreaching"

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-target-5xx"
  }
}