#!/bin/bash
#TF_LOG=debug
terraform workspace select $2
terraform $1 -var-file=<(cat environments/$2.tfvars environments/credentials.tfvars)
