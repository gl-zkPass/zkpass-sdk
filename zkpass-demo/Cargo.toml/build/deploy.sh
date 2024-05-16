#!/bin/bash

autoscaling_group_name="$1"
target_group_arn=$(aws autoscaling describe-auto-scaling-groups \
										--region ap-southeast-3 \
										--auto-scaling-group-names "${autoscaling_group_name}"\
										--output json | jq -r '.AutoScalingGroups[0].TargetGroupARNs[0]')

STARTING_PERIOD=${STARTING_PERIOD:-30}

function wait_all_instances_until_healthy {
	autoscaling_group_name="$1"

	running_time=0
	healthy=false
	while [ $healthy == false ] || [ $running_time -le "${TIMEOUT:-600}" ]; do
		healthy=true
		for status in $(aws autoscaling describe-auto-scaling-groups \
			--auto-scaling-group-names "$autoscaling_group_name" \
			--output json | jq -r '.AutoScalingGroups[0].Instances[].HealthStatus'); do
				if [[ $status == "Unhealthy" ]]; then
					healthy=false
					echo "Found unhealthy instance..."
					break
				fi
		done

		running_time=$(( running_time + 15 ))
		sleep 15
		echo "Recheck..."
	done

	if [[ $running_time == "$TIMEOUT" ]]; then
		echo "Failed health check."
		exit 255
	fi
}

autoscaling_description=$(aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names "$autoscaling_group_name" --output json)
desired_count=$(echo "$autoscaling_description" | jq -r '.AutoScalingGroups[0].DesiredCapacity')

echo "Current desired instance: $desired_count"
aws autoscaling set-desired-capacity \
    --auto-scaling-group-name "$autoscaling_group_name" \
    --desired-capacity $(( desired_count * 2 ))

aws autoscaling update-auto-scaling-group \
    --auto-scaling-group-name "$autoscaling_group_name" \
    --termination-policies OldestInstance

exit=0
sleep "$STARTING_PERIOD"
echo "Starting health check..."
if [[ $(echo "$autoscaling_description" | jq -r '.AutoScalingGroups[0].HealthCheckType') == "ELB" ]]; then
    echo "Wait all instances registered in target group is healthy..."
    aws elbv2 wait target-in-service --target-group-arn "$target_group_arn" --debug || exit=$?
else
    echo "Wait all instances registered in autoscaling group is healthy..."
    wait_all_instances_until_healthy "$autoscaling_group_name" || exit=$?
fi

if [[ $exit != 0 ]]; then
    aws autoscaling update-auto-scaling-group \
        --auto-scaling-group-name "$autoscaling_group_name" \
        --termination-policies NewestInstance
    echo "Deployment failed. Terminating newest instance..."
fi

aws autoscaling set-desired-capacity \
    --auto-scaling-group-name "$autoscaling_group_name" \
    --desired-capacity "$desired_count"

exit $exit
