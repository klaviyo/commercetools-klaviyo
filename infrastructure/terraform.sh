#!/bin/bash
#TF_LOG=debug
terraform $1 -var-file=<(cat environments/dev.tfvars environments/credentials.tfvars)
