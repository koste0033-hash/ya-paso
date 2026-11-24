@echo off
setlocal
chcp 65001 >nul
title Renderizar - La Batalla de Puebla
cd /d "%~dp0"

echo ============================================================
echo   La Batalla de Puebla - render del video
echo ============================================================
echo.

rem --- 1. Node.js instalado? ---
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] No encontre Node.js.
  echo Instala la version LTS desde https://nodejs.org y vuelve a abrir este archivo.
  goto :fin
)
for /f "delims=" %%v in ('node -v') do echo Node.js encontrado: %%v

rem --- 2. Dependencias (solo la primera vez) ---
if not exist "node_modules\remotion" (
  echo.
  echo Instalando dependencias por primera vez. Puede tardar unos minutos...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de dependencias. Revisa tu conexion a internet.
    goto :fin
  )
)

rem --- 3. Tarjeta grafica ---
echo.
echo Revisando tu tarjeta grafica...
echo Modo sin GPU: sera mas lento.
echo.

rem --- 4. Voz (opcional): public\voz\voz.wav ---
if not exist "salida" mkdir "salida"
if exist "public\voz\voz.wav" (
  echo Voz encontrada: public\voz\voz.wav
  > "salida\props.json" echo {"voz":"voz/voz.wav"}
) else (
  echo Aviso: no hay voz en public\voz\voz.wav. El video saldra sin audio.
  > "salida\props.json" echo {"mute":true}
)

rem --- 5. Render ---
set "SALIDA=salida\puebla_%DATE:~-4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%.mp4"
set "SALIDA=%SALIDA: =0%"
echo.
echo Renderizando... (la primera vez descarga un navegador; no cierres esta ventana)
call npx remotion render src/index.ts Puebla "%SALIDA%" --gl=swangle --codec h264 --crf 16 --props="salida\props.json" --timeout=240000
if errorlevel 1 (
  echo.
  echo [ERROR] El render fallo. Copia el mensaje de arriba y mandaselo a Claude.
  echo 
  goto :fin
)

echo.
echo ============================================================
echo   LISTO. Tu video esta en:
echo   %CD%\%SALIDA%
echo ============================================================
explorer "salida"

:fin
echo.
pause
