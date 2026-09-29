output "groq_api_key_secret_id" {
  description = "Groq API key secret ID"
  value       = aws_secretsmanager_secret.groq_api_key.id
}

output "groq_api_key_secret_arn" {
  description = "Groq API key secret ARN"
  value       = aws_secretsmanager_secret.groq_api_key.arn
}

output "groq_api_key_secret_name" {
  description = "Groq API key secret name"
  value       = aws_secretsmanager_secret.groq_api_key.name
}