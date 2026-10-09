@echo off
title MediStock Backend
echo ===================================================
echo Starting MediStock Spring Boot Backend (Port 8080)
echo ===================================================
cd /d "%~dp0"
call mvnw.cmd spring-boot:run
pause
