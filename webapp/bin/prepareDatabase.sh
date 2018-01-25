#!/bin/bash
mysql -u test matchpoints_test < tables.sql
echo -e "\033[32mDatabase Created   ✓\033[0m"
