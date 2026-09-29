data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }

    actions = [
      "sts:AssumeRole"
    ]
  }
}

resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project_name}-${var.environment}-ecs-execution-role"

  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-execution-role"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "ecs_secret_access" {
  statement {
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue"
    ]

    resources = [
      var.groq_secret_arn
    ]
  }
}

resource "aws_iam_policy" "ecs_secret_access" {
  name        = "${var.project_name}-${var.environment}-ecs-secret-access"
  description = "Allow ECS to retrieve the Groq API key"

  policy = data.aws_iam_policy_document.ecs_secret_access.json

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-secret-access"
  }
}

resource "aws_iam_role_policy_attachment" "ecs_secret_access" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.ecs_secret_access.arn
}