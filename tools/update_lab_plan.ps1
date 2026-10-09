param(
    [Parameter(Mandatory=$true)][string]$SourcePath,
    [Parameter(Mandatory=$true)][string]$TemplateArchive
)
$ErrorActionPreference = 'Stop'
# Windows PowerShell 5.1 defaults to ASCII when piping text to native programs.
# Execute the UTF-8 Python file directly. Never pipe Python source code.
$OutputEncoding = New-Object System.Text.UTF8Encoding($false)
python (Join-Path $PSScriptRoot 'update_lab_plan.py') --source $SourcePath --templates $TemplateArchive
if ($LASTEXITCODE -ne 0) { throw 'Lab plan update failed.' }
