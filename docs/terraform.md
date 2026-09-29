## Terraform: Secrets + IAM Least Privilege + CloudWatch Alarms

```
cloudops-ai-platform/
└── infra/
    └── terraform/
        ├── provider.tf
        ├── variables.tf
        ├── secrets.tf
        ├── iam.tf
        ├── cloudwatch.tf
        └── outputs.tf

```

## IAM Least Privilege
```
ECS Task
   │
   ├── Pull image → ECR
   ├── Write logs → CloudWatch
   └── Read secret → Secrets Manager
   ```

## CloudWatch Alarms
   ```   
   ALB
 ├── HTTP 5xx
 └── Response latency

AI
 └── Custom AI metric / cost-token spike
 ```

 
 ```
 Secrets Manager
└── cloudops-ai-platform/dev/groq-api-key

IAM
└── secret access policy

CloudWatch
├── /aws/ecs/devops-nestjs-app
├── ALB 5xx alarm
├── ALB latency alarm
├── ECS CPU alarm
└── ECS memory alarm
 ```

 ```
 infra/
└── terraform/
    ├── envs/
    │   └── dev/
    │       ├── main.tf
    │       ├── outputs.tf
    │       ├── provider.tf
    │       ├── terraform.tfvars
    │       └── variables.tf
    │
    └── modules/
        ├── networking/
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── variables.tf
        │
        ├── ecr/
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── variables.tf
        │
        ├── secrets/
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── variables.tf
        │
        ├── iam/
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── variables.tf
        │
        ├── monitoring/
        │   ├── main.tf
        │   ├── outputs.tf
        │   └── variables.tf
        │
        └── ecs/
            ├── main.tf
            ├── outputs.tf
            └── variables.tf
            ```



                    Internet
                       │
                  Internet GW
                       │
             ┌─────────┴─────────┐
             │                   │
        Public Subnet 1     Public Subnet 2
        ap-south-1a         ap-south-1b
             │                   │
             └─────────┬─────────┘
                       │
                 ECS Fargate
                  Task 3000
                       │
          ┌────────────┼────────────┐
          │            │            │
         ECR       Secrets Mgr   CloudWatch
       Image       GROQ_API_KEY     Logs