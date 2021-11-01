#!/usr/bin/bash

export CYPRESS_RESOURCE_ID="${CYPRESS_RESOURCE_ID:-"$(date +"%s")"}"

oc login --insecure-skip-tls-verify -u $CYPRESS_OC_CLUSTER_USER -p $CYPRESS_OC_HUB_CLUSTER_PASS $CYPRESS_OC_HUB_CLUSTER_URL 
oc get managedclusters $CLUSTER_LABEL_SELECTOR -o custom-columns='name:.metadata.name,available:.status.conditions[?(@.reason=="ManagedClusterAvailable")].status,vendor:.metadata.labels.vendor' --no-headers | awk '/True/ { printf "%s:\n  vendor: %s\n", $1, $3 }' > ./tests/cypress/config/clusters.yaml