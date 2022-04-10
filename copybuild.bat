del contracts\*.*

set dSource=..\DAOCaster\artifacts\contracts
set dTarget=contracts
set fType=*.json
for /f "delims=" %%f in ('dir /a-d /b /s "%dSource%\%fType%"') do (
    copy /V "%%f" "%dTarget%\" 2>nul
)