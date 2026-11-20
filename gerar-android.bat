@echo off
echo === Preparando o app mundo calmo para Android Studio ===
call npm install --legacy-peer-deps
if errorlevel 1 goto erro
call npm run build
if errorlevel 1 goto erro
call npx cap sync android
if errorlevel 1 goto erro
echo === Abrindo Android Studio... ===
call npx cap open android
goto fim

:erro
echo Ocorreu um erro. Verifique se o Node.js e o Android Studio estao instalados.
pause

:fim
