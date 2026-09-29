resource "aws_secretsmanager_secret" "groq_api_key" {
  name        = "${var.project_name}/${var.environment}/groq-api-key"
  description = "Groq API key for ${var.project_name} ${var.environment}"

  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-groq-api-key"
  }
}