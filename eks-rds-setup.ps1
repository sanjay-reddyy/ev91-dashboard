# ========================================
# EV91: EKS + RDS Free Tier + Custom DB Setup
# ========================================

# ====== CONFIG ======
$ClusterName = "ev91-cluster"
$Region = "ap-south-1"
$NodeGroup = "ev91-nodes"
$DBIdentifier = "ev91-db"
$DBName = "ev91platform"        # Custom database name inside RDS
$DBUser = "postgres"
$DBPassword = "Sanjay123"      # Must meet AWS requirements
$DBSubnetGroup = "ev91-db-subnet-group"

# ====== STEP 1: Create EKS Cluster (Free Tier) ======
Write-Host "`n🚀 Creating EKS Cluster ($ClusterName)... Free Tier compatible"
eksctl create cluster --name $ClusterName --region $Region --nodegroup-name $NodeGroup --node-type t3.micro --nodes 2 --nodes-min 1 --nodes-max 2

# ====== STEP 2: Fetch Cluster Info ======
Write-Host "`n📡 Fetching EKS VPC, Subnet, and Security Group Info..."
$VpcId = aws eks describe-cluster --name $ClusterName --region $Region --query "cluster.resourcesVpcConfig.vpcId" --output text
$Subnets = aws eks describe-cluster --name $ClusterName --region $Region --query "cluster.resourcesVpcConfig.subnetIds[]" --output text
$SecurityGroup = aws eks describe-cluster --name $ClusterName --region $Region --query "cluster.resourcesVpcConfig.securityGroupIds[0]" --output text

Write-Host "`n✅ EKS VPC ID: $VpcId"
Write-Host "✅ EKS Subnets: $Subnets"
Write-Host "✅ EKS Security Group: $SecurityGroup`n"

# ====== STEP 3: Create RDS Subnet Group ======
Write-Host "🧱 Creating RDS Subnet Group ($DBSubnetGroup)..."
aws rds create-db-subnet-group --db-subnet-group-name $DBSubnetGroup --db-subnet-group-description "Subnet group for EKS and RDS" --subnet-ids $Subnets --region $Region | Out-Null

# ====== STEP 4: Create RDS Instance (Free Tier) ======
Write-Host "🗄️ Creating RDS PostgreSQL Instance ($DBIdentifier) with database name '$DBName'..."
aws rds create-db-instance --db-instance-identifier $DBIdentifier --db-instance-class db.t3.micro --engine postgres --master-username $DBUser --master-user-password $DBPassword --allocated-storage 20 --vpc-security-group-ids $SecurityGroup --db-subnet-group-name $DBSubnetGroup --db-name $DBName --backup-retention-period 7 --no-publicly-accessible --region $Region

# ====== STEP 5: Wait Until RDS is Available ======
Write-Host "`n⏳ Waiting for RDS instance to become available..."
aws rds wait db-instance-available --db-instance-identifier $DBIdentifier --region $Region

# ====== STEP 6: Fetch and Display Endpoint ======
$DBEndpoint = aws rds describe-db-instances --db-instance-identifier $DBIdentifier --region $Region --query "DBInstances[0].Endpoint.Address" --output text

Write-Host "`n🎉 All Done! Free Tier compatible setup complete."
Write-Host "---------------------------------------------"
Write-Host "✅ EKS Cluster Name : $ClusterName"
Write-Host "✅ RDS Identifier   : $DBIdentifier"
Write-Host "✅ RDS Database Name: $DBName"
Write-Host "✅ RDS Endpoint     : $DBEndpoint"
Write-Host "✅ Username         : $DBUser"
Write-Host "✅ Password         : $DBPassword"
Write-Host "---------------------------------------------"
Write-Host "`nYou can now connect your EKS pods to this RDS endpoint directly inside the same VPC."
