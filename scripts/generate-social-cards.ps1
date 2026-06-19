Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
$outputDirectory = Join-Path $root "public\social"
$logoPath = Join-Path $root "src\assets\cultura-logo-horizontal.png"

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

function New-CoverImage {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Image]$Image
  )

  $targetWidth = 1200
  $targetHeight = 630
  $sourceRatio = $Image.Width / $Image.Height
  $targetRatio = $targetWidth / $targetHeight

  if ($sourceRatio -gt $targetRatio) {
    $sourceHeight = $Image.Height
    $sourceWidth = [int]($sourceHeight * $targetRatio)
    $sourceX = [int](($Image.Width - $sourceWidth) / 2)
    $sourceY = 0
  } else {
    $sourceWidth = $Image.Width
    $sourceHeight = [int]($sourceWidth / $targetRatio)
    $sourceX = 0
    $sourceY = [int](($Image.Height - $sourceHeight) / 2)
  }

  $destination = New-Object System.Drawing.Rectangle 0, 0, $targetWidth, $targetHeight
  $source = New-Object System.Drawing.Rectangle $sourceX, $sourceY, $sourceWidth, $sourceHeight
  $Graphics.DrawImage($Image, $destination, $source, [System.Drawing.GraphicsUnit]::Pixel)
}

function Draw-WrappedText {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [System.Drawing.Font]$Font,
    [System.Drawing.Brush]$Brush,
    [float]$X,
    [float]$Y,
    [float]$MaxWidth,
    [float]$LineHeight
  )

  $words = $Text.Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries)
  $line = ""
  $currentY = $Y

  foreach ($word in $words) {
    $candidate = if ($line) { "$line $word" } else { $word }
    if ($Graphics.MeasureString($candidate, $Font).Width -gt $MaxWidth -and $line) {
      $Graphics.DrawString($line, $Font, $Brush, $X, $currentY)
      $line = $word
      $currentY += $LineHeight
    } else {
      $line = $candidate
    }
  }

  if ($line) {
    $Graphics.DrawString($line, $Font, $Brush, $X, $currentY)
  }
}

function New-SocialCard {
  param(
    [string]$FileName,
    [string]$Title,
    [string]$Eyebrow,
    [string]$Accent,
    [string]$Photo
  )

  $bitmap = New-Object System.Drawing.Bitmap 1200, 630
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $photoImage = [System.Drawing.Image]::FromFile($Photo)
  New-CoverImage -Graphics $graphics -Image $photoImage
  $photoImage.Dispose()

  $overlayRectangle = New-Object System.Drawing.Rectangle 0, 0, 880, 630
  $overlayBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $overlayRectangle,
    [System.Drawing.Color]::FromArgb(248, 32, 31, 63),
    [System.Drawing.Color]::FromArgb(35, 32, 31, 63),
    [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal
  )
  $graphics.FillRectangle($overlayBrush, $overlayRectangle)
  $overlayBrush.Dispose()

  $accentColor = [System.Drawing.ColorTranslator]::FromHtml($Accent)
  $accentBrush = New-Object System.Drawing.SolidBrush $accentColor
  $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(225, 255, 255, 255))
  $panelBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(238, 255, 255, 255))

  $graphics.FillRectangle($panelBrush, 62, 45, 400, 91)
  $logoImage = [System.Drawing.Image]::FromFile($logoPath)
  $logoHeight = 54
  $logoWidth = [int]($logoImage.Width * ($logoHeight / $logoImage.Height))
  $graphics.DrawImage($logoImage, 82, 63, $logoWidth, $logoHeight)
  $logoImage.Dispose()

  $graphics.FillRectangle($accentBrush, 62, 178, 62, 7)

  $eyebrowFont = New-Object System.Drawing.Font "Segoe UI", 17, ([System.Drawing.FontStyle]::Bold)
  $titleFont = New-Object System.Drawing.Font "Segoe UI", 49, ([System.Drawing.FontStyle]::Bold)
  $siteFont = New-Object System.Drawing.Font "Segoe UI", 17, ([System.Drawing.FontStyle]::Regular)

  $graphics.DrawString($Eyebrow.ToUpperInvariant(), $eyebrowFont, $accentBrush, 62, 202)
  Draw-WrappedText -Graphics $graphics -Text $Title -Font $titleFont -Brush $whiteBrush -X 58 -Y 249 -MaxWidth 690 -LineHeight 63
  $graphics.DrawString("cultura.siqueiracampos.pr.gov.br", $siteFont, $mutedBrush, 62, 535)

  $bandWidth = 240
  $bandColors = @("#414296", "#00A859", "#F7A600", "#EF1B2D", "#0B86D8")
  for ($index = 0; $index -lt $bandColors.Count; $index++) {
    $bandBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($bandColors[$index]))
    $graphics.FillRectangle($bandBrush, $index * $bandWidth, 615, $bandWidth, 15)
    $bandBrush.Dispose()
  }

  $outputPath = Join-Path $outputDirectory $FileName
  $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $eyebrowFont.Dispose()
  $titleFont.Dispose()
  $siteFont.Dispose()
  $accentBrush.Dispose()
  $whiteBrush.Dispose()
  $mutedBrush.Dispose()
  $panelBrush.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

$genericPhoto = Join-Path $root "scripts\assets\cultura-editorial-background.png"
$museumPhoto = Join-Path $root "public\museu-galeria\museu-galeria-12.jpeg"
$cultureHousePhoto = Join-Path $root "public\casa-da-cultura\auditorio-casa-da-cultura.jfif"

$cards = @(
  @{ FileName = "home.png"; Title = "Cultura, memória e criação"; Eyebrow = "Secretaria Municipal de Cultura"; Accent = "#F7A600"; Photo = $genericPhoto },
  @{ FileName = "museu.png"; Title = "Museu Histórico Municipal"; Eyebrow = "Memória de Siqueira Campos"; Accent = "#414296"; Photo = $museumPhoto },
  @{ FileName = "biblioteca.png"; Title = "Biblioteca Municipal"; Eyebrow = "Leitura e conhecimento"; Accent = "#00A859"; Photo = $genericPhoto },
  @{ FileName = "casa-da-cultura.png"; Title = "Onde a cultura sobe ao palco"; Eyebrow = "Casa da Cultura"; Accent = "#F7A600"; Photo = $cultureHousePhoto },
  @{ FileName = "eventos.png"; Title = "Agenda cultural do município"; Eyebrow = "Eventos"; Accent = "#0B86D8"; Photo = $genericPhoto },
  @{ FileName = "editais.png"; Title = "Editais e chamadas culturais"; Eyebrow = "Oportunidades"; Accent = "#F7A600"; Photo = $genericPhoto },
  @{ FileName = "inscricoes.png"; Title = "Inscrições abertas"; Eyebrow = "Participe"; Accent = "#EF1B2D"; Photo = $genericPhoto },
  @{ FileName = "acervo.png"; Title = "Conheça o acervo do Museu"; Eyebrow = "Objetos e histórias"; Accent = "#414296"; Photo = $museumPhoto },
  @{ FileName = "sobre.png"; Title = "Memória preservada para o futuro"; Eyebrow = "Sobre o Museu"; Accent = "#414296"; Photo = $museumPhoto },
  @{ FileName = "visite.png"; Title = "Planeje sua visita ao Museu"; Eyebrow = "Entrada gratuita"; Accent = "#00A859"; Photo = $museumPhoto },
  @{ FileName = "contribua.png"; Title = "Ajude a preservar nossa memória"; Eyebrow = "Contribua com o Museu"; Accent = "#EF1B2D"; Photo = $museumPhoto },
  @{ FileName = "historias.png"; Title = "Histórias do Museu e da Cultura"; Eyebrow = "Patrimônio e memória"; Accent = "#F7A600"; Photo = $museumPhoto }
)

foreach ($card in $cards) {
  New-SocialCard @card
}

Get-ChildItem $outputDirectory -Filter "*.png" |
  Select-Object Name, Length
