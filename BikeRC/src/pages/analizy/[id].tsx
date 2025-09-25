import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { LineChart, BarChart } from '@mui/x-charts';
import { useParams, useNavigate } from 'react-router-dom';
import apiService, { type VideoProcessingJob } from '../../services/ApiService';
import jobMetadataService from '../../services/JobMetadataService';

// Extended job details interface for video URLs
interface ExtendedJobDetails extends VideoProcessingJob {
  output_video?: {
    path?: string;
  };
  download_urls?: {
    video?: string;
    csv?: string;
  };
}

// Status object interface
interface StatusObject {
  status?: string;
  message?: string;
  progress?: number;
  completed_at?: string;
}

interface CsvRow {
  [key: string]: string | number;
}

// Removed unused BodyPart interface - using inline type from bodyParts array

const AnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedBodyPart, setSelectedBodyPart] = useState('Prawe ramię');
  const [jobDetails, setJobDetails] = useState<VideoProcessingJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);

  console.log('Analysis ID from URL:', id);

  // Body parts configuration - memoized to prevent re-renders
  const bodyParts = useMemo(() => [
    {
      "index": 0,
      "name": "Right shoulder",
      "name_pl": "Prawe ramię"
    },
    {
      "index": 1,
      "name": "Left shoulder",
      "name_pl": "Lewe ramię"
    },
    {
      "index": 2,
      "name": "Right elbow",
      "name_pl": "Prawy łokieć"
    },
    {
      "index": 3,
      "name": "Left elbow",
      "name_pl": "Lewy łokieć"
    },
    {
      "index": 4,
      "name": "Right wrist",
      "name_pl": "Prawy nadgarstek"
    },
    {
      "index": 5,
      "name": "Left wrist",
      "name_pl": "Lewy nadgarstek"
    },
    {
      "index": 6,
      "name": "Right hip",
      "name_pl": "Prawe biodro"
    },
    {
      "index": 7,
      "name": "Left hip",
      "name_pl": "Lewe biodro"
    },
    {
      "index": 8,
      "name": "Right knee",
      "name_pl": "Prawe kolano"
    },
    {
      "index": 9,
      "name": "Left knee",
      "name_pl": "Lewe kolano"
    },
    {
      "index": 10,
      "name": "Right ankle",
      "name_pl": "Prawa kostka"
    },
    {
      "index": 11,
      "name": "Left ankle",
      "name_pl": "Lewa kostka"
    }
  ], []);

  // Fetch job details when component mounts
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (id) {
        try {
          setLoading(true);
          console.log('Fetching job details for ID:', id);
          const response = await apiService.getJobDetails(id);
          console.log('Job details response:', response);
          console.log('Job status type:', typeof response.status, response.status);
          setJobDetails(response);
        } catch (error) {
          console.error('Error fetching job details:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No ID provided in URL');
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // Get video URL from job details
  const getVideoUrl = useCallback(() => {
    if (!jobDetails) return null;

    // Try different possible paths for video URL
    const response = jobDetails as ExtendedJobDetails;
    const relativePath = response?.output_video?.path ||
      response?.download_urls?.video ||
      response?.outputUrl ||
      null;

    if (!relativePath) return null;

    // Prepend API base URL if the path is relative
    const videoUrl = relativePath.startsWith('http')
      ? relativePath
      : `https://api-mo2s.netrix.com.pl${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;

    console.log('Video URL found:', videoUrl);
    return videoUrl;
  }, [jobDetails]);

  // Get CSV URL from job details
  const getCsvUrl = () => {
    if (!jobDetails) return null;

    const response = jobDetails as ExtendedJobDetails;
    const relativePath = response?.download_urls?.csv || null;

    if (!relativePath) return null;

    // Prepend API base URL if the path is relative
    const csvUrl = relativePath.startsWith('http')
      ? relativePath
      : `https://api-mo2s.netrix.com.pl${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;

    console.log('CSV URL found:', csvUrl);
    return csvUrl;
  };


  // CSV parsing utility
  const parseCSV = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return { headers: [], data: [] };

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
      const row: CsvRow = {};
      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Try to parse as number, otherwise keep as string
        const numValue = parseFloat(value);
        row[header] = !isNaN(numValue) && isFinite(numValue) ? numValue : value;
      });
      return row;
    });

    return { headers, data };
  };

  // Download and parse CSV data
  const downloadAndParseCsv = async (csvUrl: string) => {
    try {
      setLoadingCsv(true);
      console.log('Downloading CSV data from:', csvUrl);

      const response = await fetch(csvUrl, {
        method: 'GET',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvText = await response.text();
      console.log('CSV data downloaded, length:', csvText.length);

      const { headers, data } = parseCSV(csvText);
      console.log('CSV parsed:', { headers, rowCount: data.length });

      setCsvHeaders(headers);
      setCsvData(data);

    } catch (error) {
      console.error('Error downloading CSV:', error);
    } finally {
      setLoadingCsv(false);
    }
  };

  // Auto-download CSV when job details are loaded
  useEffect(() => {
    const csvUrl = getCsvUrl();
    if (csvUrl && csvData.length === 0 && !loadingCsv) {
      downloadAndParseCsv(csvUrl);
    }
  }, [jobDetails, csvData.length, loadingCsv]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get angle data for selected body part
  const getAngleDataForBodyPart = useCallback((bodyPartName: string) => {
    const bodyPart = bodyParts.find(part => part.name_pl === bodyPartName);
    if (!bodyPart || csvData.length === 0) return [];

    const angleColumn = `angle_${bodyPart.index}`;

    // Try to find frame column with different possible names
    const frameColumn = csvHeaders.find(header =>
      header.toLowerCase().includes('frame') ||
      header.toLowerCase().includes('time') ||
      header.toLowerCase() === 'x' ||
      header === 'Frame' ||
      header === 'frame'
    ) || csvHeaders[0]; // Use first column as fallback

    console.log('Using columns:', { angleColumn, frameColumn, bodyPartIndex: bodyPart.index });

    return csvData
      .filter(row => row[angleColumn] !== undefined && row[frameColumn] !== undefined)
      .map((row, index) => ({
        frame: typeof row[frameColumn] === 'number' ? row[frameColumn] :
          !isNaN(parseFloat(String(row[frameColumn]))) ? parseFloat(String(row[frameColumn])) : index,
        angle: typeof row[angleColumn] === 'number' ? row[angleColumn] : parseFloat(String(row[angleColumn])),
      }))
      .filter(point => !isNaN(point.frame) && !isNaN(point.angle))
      .sort((a, b) => a.frame - b.frame);
  }, [csvData, csvHeaders, bodyParts]);

  // Get available angle columns from CSV
  const getAvailableAngleColumns = () => {
    if (csvHeaders.length === 0) return [];
    return csvHeaders.filter(header => header.startsWith('angle_'));
  };

  // Download all analysis data
  const downloadCompleteReport = async () => {
    try {
      setDownloadingReport(true);
      const downloads = [];
      
      // 1. Download video if available
      const videoUrl = getVideoUrl();
      if (videoUrl) {
        downloads.push({
          url: videoUrl,
          filename: `analysis-${id}-video.mp4`,
          type: 'video'
        });
      }

      // 2. Download CSV if available
      const csvUrl = getCsvUrl();
      if (csvUrl) {
        downloads.push({
          url: csvUrl,
          filename: `analysis-${id}-data.csv`,
          type: 'csv'
        });
      }

      // 3. Generate and download deviation analysis report
      if (getLeftRightDeviationData().length > 0) {
        const deviationReport = generateDeviationReport();
        const blob = new Blob([deviationReport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        downloads.push({
          url: url,
          filename: `analysis-${id}-deviations.txt`,
          type: 'report',
          isBlob: true
        });
      }

      // 4. Generate timeline chart data export
      if (csvData.length > 0) {
        const chartData = generateChartDataExport();
        const blob = new Blob([chartData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        downloads.push({
          url: url,
          filename: `analysis-${id}-chart-data.json`,
          type: 'chart',
          isBlob: true
        });
      }

      // Download all files
      for (const download of downloads) {
        const link = document.createElement('a');
        link.href = download.url;
        link.download = download.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URLs
        if (download.isBlob) {
          setTimeout(() => URL.revokeObjectURL(download.url), 1000);
        }
        
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`Downloaded ${downloads.length} files for analysis ${id}`);
      
    } catch (error) {
      console.error('Error downloading complete report:', error);
    } finally {
      setDownloadingReport(false);
    }
  };

  // Generate deviation analysis report
  const generateDeviationReport = () => {
    const deviationData = getLeftRightDeviationData();
    const timestamp = new Date().toLocaleString('pl-PL');
    
    let report = `RAPORT ANALIZY ODCHYLEŃ LEWA/PRAWA\n`;
    report += `===========================================\n\n`;
    report += `ID Analizy: ${id}\n`;
    report += `Data wygenerowania: ${timestamp}\n`;
    report += `Liczba analizowanych części ciała: ${deviationData.length}\n\n`;
    
    report += `SZCZEGÓŁOWA ANALIZA ODCHYLEŃ:\n`;
    report += `------------------------------\n\n`;
    
    deviationData.forEach((item, index) => {
      if (item) {
        report += `${index + 1}. ${item.bodyPart.toUpperCase()}\n`;
        report += `   Lewa strona: ${item.leftAvg.toFixed(2)}° (próbek: ${item.leftDataCount})\n`;
        report += `   Prawa strona: ${item.rightAvg.toFixed(2)}° (próbek: ${item.rightDataCount})\n`;
        report += `   Odchylenie: ${item.deviation.toFixed(2)}°\n`;
        report += `   Zakres lewa: ${item.leftMin.toFixed(2)}° - ${item.leftMax.toFixed(2)}°\n`;
        report += `   Zakres prawa: ${item.rightMin.toFixed(2)}° - ${item.rightMax.toFixed(2)}°\n`;
        
        let status = 'NORMALNE';
        if (item.deviation > 10) status = 'WYSOKIE ODCHYLENIE';
        else if (item.deviation > 5) status = 'UMIARKOWANE ODCHYLENIE';
        
        report += `   Status: ${status}\n\n`;
      }
    });
    
    const avgDeviation = deviationData.reduce((sum, item) => sum + (item?.deviation || 0), 0) / deviationData.length;
    report += `PODSUMOWANIE:\n`;
    report += `-------------\n`;
    report += `Średnie odchylenie wszystkich części: ${avgDeviation.toFixed(2)}°\n`;
    report += `Części z wysokim odchyleniem (>10°): ${deviationData.filter(item => item && item.deviation > 10).length}\n`;
    report += `Części z umiarkowanym odchyleniem (5-10°): ${deviationData.filter(item => item && item.deviation > 5 && item.deviation <= 10).length}\n`;
    report += `Części z normalnym odchyleniem (<5°): ${deviationData.filter(item => item && item.deviation <= 5).length}\n\n`;
    
    report += `REKOMENDACJE:\n`;
    report += `-------------\n`;
    if (avgDeviation > 10) {
      report += `- Wysokie średnie odchylenie wymaga konsultacji specjalisty\n`;
      report += `- Zalecane dodatkowe badania i terapia korekcyjna\n`;
    } else if (avgDeviation > 5) {
      report += `- Umiarkowane odchylenie - zalecane ćwiczenia korekcyjne\n`;
      report += `- Regularne monitorowanie postępów\n`;
    } else {
      report += `- Odchylenia w normie - kontynuacja obecnej aktywności\n`;
      report += `- Regularne kontrole profilaktyczne\n`;
    }
    
    return report;
  };

  // Generate chart data export
  const generateChartDataExport = () => {
    const timelineChartData = {
      selectedBodyPart,
      angleData: getAngleDataForBodyPart(selectedBodyPart),
      timestamp: new Date().toISOString(),
      analysisId: id
    };
    
    const deviationAnalysisData = getLeftRightDeviationData();
    const chartDataForExport = {
      categories: deviationAnalysisData.map(item => item?.bodyPart || ''),
      leftSeries: deviationAnalysisData.map(item => item?.leftAvg || 0),
      rightSeries: deviationAnalysisData.map(item => item?.rightAvg || 0),
      deviationSeries: deviationAnalysisData.map(item => item?.deviation || 0)
    };
    
    const deviationChartExportData = {
      leftRightComparison: deviationAnalysisData,
      chartData: chartDataForExport,
      timestamp: new Date().toISOString(),
      analysisId: id
    };
    
    return JSON.stringify({
      timelineChart: timelineChartData,
      deviationChart: deviationChartExportData,
      metadata: {
        exportedAt: new Date().toISOString(),
        analysisId: id,
        totalDataPoints: csvData.length,
        availableColumns: csvHeaders
      }
    }, null, 2);
  };

  // Get left vs right deviation data for comparison
  const getLeftRightDeviationData = useCallback(() => {
    if (csvData.length === 0) return [];

    // Define left-right pairs based on body parts
    const leftRightPairs = [
      { left: 'Lewe ramię', right: 'Prawe ramię', leftIndex: 1, rightIndex: 0 },
      { left: 'Lewy łokieć', right: 'Prawy łokieć', leftIndex: 3, rightIndex: 2 },
      { left: 'Lewy nadgarstek', right: 'Prawy nadgarstek', leftIndex: 5, rightIndex: 4 },
      { left: 'Lewe biodro', right: 'Prawe biodro', leftIndex: 7, rightIndex: 6 },
      { left: 'Lewe kolano', right: 'Prawe kolano', leftIndex: 9, rightIndex: 8 },
      { left: 'Lewa kostka', right: 'Prawa kostka', leftIndex: 11, rightIndex: 10 },
    ];

    return leftRightPairs.map(pair => {
      const leftColumn = `angle_${pair.leftIndex}`;
      const rightColumn = `angle_${pair.rightIndex}`;

      // Get data for both sides
      const leftData = csvData
        .map(row => typeof row[leftColumn] === 'number' ? row[leftColumn] : parseFloat(String(row[leftColumn])))
        .filter(val => !isNaN(val) && isFinite(val));

      const rightData = csvData
        .map(row => typeof row[rightColumn] === 'number' ? row[rightColumn] : parseFloat(String(row[rightColumn])))
        .filter(val => !isNaN(val) && isFinite(val));

      if (leftData.length === 0 || rightData.length === 0) {
        return null;
      }

      // Calculate statistics
      const leftAvg = leftData.reduce((a, b) => a + b, 0) / leftData.length;
      const rightAvg = rightData.reduce((a, b) => a + b, 0) / rightData.length;
      const deviation = Math.abs(leftAvg - rightAvg);
      const leftMin = Math.min(...leftData);
      const leftMax = Math.max(...leftData);
      const rightMin = Math.min(...rightData);
      const rightMax = Math.max(...rightData);

      return {
        bodyPart: pair.left.replace('Lewe ', '').replace('Lewa ', '').replace('Lewy ', ''),
        leftName: pair.left,
        rightName: pair.right,
        leftAvg,
        rightAvg,
        deviation,
        leftMin,
        leftMax,
        rightMin,
        rightMax,
        leftDataCount: leftData.length,
        rightDataCount: rightData.length,
        hasData: true
      };
    }).filter(Boolean);
  }, [csvData]);

  // Generate deviation comparison data for chart
  const deviationChartData = useMemo(() => {
    const deviationData = getLeftRightDeviationData();

    if (deviationData.length === 0) {
      return {
        categories: ['Brak danych'],
        leftSeries: [0],
        rightSeries: [0],
        deviationSeries: [0]
      };
    }

    return {
      categories: deviationData.map(item => item?.bodyPart),
      leftSeries: deviationData.map(item => item?.leftAvg ?? 0),
      rightSeries: deviationData.map(item => item?.rightAvg ?? 0),
      deviationSeries: deviationData.map(item => item?.deviation ?? 0)
    };
  }, [getLeftRightDeviationData]);




  // Generate timeline data from CSV for selected body part
  const timelineData = useMemo(() => {
    const angleData = getAngleDataForBodyPart(selectedBodyPart);

    if (angleData.length === 0) {
      // Return empty data if no angle data available
      return {
        xAxis: [0],
    series: [
      {
            data: [0],
        color: '#22D3BB',
            label: 'Dane',
      },
    ],
  };
    }

    return {
      xAxis: angleData.map(point => point.frame),
      series: [
        {
          data: angleData.map(point => point.angle),
          color: '#22D3BB',
          label: `${selectedBodyPart} - Dane`,
        },
      ],
    };
  }, [selectedBodyPart, getAngleDataForBodyPart]); // Dependencies to recalculate when data changes


  const handleBack = () => {
    navigate('/analizy');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={handleBack}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#f5f5f5',
            border: '1px solid #e0e0e0',
            mr: 2,
            '&:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          <ArrowBackIcon sx={{ color: '#666', fontSize: 20 }} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
            Szczegóły pomiaru
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'baseline' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          {(() => {
            if (!jobDetails) return 'Szczegóły pomiaru';
            const metadata = jobMetadataService.getJobMetadata(jobDetails.job_id || jobDetails.id);
            return metadata?.name || `Analiza`;
          })()}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          <strong>Rower:</strong> {(() => {
            if (!jobDetails) return 'Nieznany rower';
            const metadata = jobMetadataService.getJobMetadata(jobDetails.job_id || jobDetails.id);
            return metadata?.bike_info?.model || metadata?.bike_info?.brand || 'Nieznany rower';
          })()}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          <strong>Data:</strong> {(() => {
            if (!jobDetails) return new Date().toLocaleDateString('pl-PL');
            const metadata = jobMetadataService.getJobMetadata(jobDetails.job_id || jobDetails.id);
            return metadata?.updated_at 
              ? new Date(metadata.updated_at).toLocaleDateString('pl-PL')
              : new Date().toLocaleDateString('pl-PL');
          })()}
        </Typography>
      </Box>

      {/* Video Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
          Wideo z pomiarem
        </Typography>

        {/* Video Player Area */}
        <Box
          sx={{
            width: '100%',
            height: 400,
            backgroundColor: '#f8f9fa',
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <Typography variant="body1" color="textSecondary">
                Ładowanie danych...
              </Typography>
            </Box>
          ) : getVideoUrl() ? (
            <video
              controls
              preload="metadata"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                const video = e.target as HTMLVideoElement;
                console.error('Video loading error:', {
                  error: e,
                  videoError: video.error,
                  videoErrorCode: video.error?.code,
                  videoErrorMessage: video.error?.message,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  currentSrc: video.currentSrc
                });
                setVideoError(true);
              }}
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                console.log('Video metadata loaded:', {
                  duration: video.duration,
                  videoWidth: video.videoWidth,
                  videoHeight: video.videoHeight,
                  src: video.currentSrc
                });
              }}
              onCanPlay={() => {
                console.log('Video can play successfully!');
                setVideoError(false);
              }}
              src={getVideoUrl()!}
            >
              Twoja przeglądarka nie obsługuje odtwarzania wideo.
            </video>
          ) : getVideoUrl() && videoError ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
                backgroundColor: '#f8f9fa',
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Problem z odtwarzaniem wideo
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mb: 2 }}>
                Wideo nie może być odtworzone. Sprawdź konsolę dla szczegółów lub pobierz wideo.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setVideoError(false);
                    // Force video reload
                    const video = document.querySelector('video');
                    if (video) {
                      video.load();
                    }
                  }}
                  sx={{
                    borderColor: '#22D3BB',
                    color: '#22D3BB',
                    '&:hover': { borderColor: '#1bb5a3', backgroundColor: '#f0fffe' },
                  }}
                >
                  Spróbuj ponownie
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const videoUrl = getVideoUrl();
                    if (videoUrl) {
                      const link = document.createElement('a');
                      link.href = videoUrl;
                      link.download = `analysis-${id}-video.mp4`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  sx={{
                    backgroundColor: '#22D3BB',
                    '&:hover': { backgroundColor: '#1bb5a3' },
                  }}
                >
                  Pobierz wideo
                </Button>
              </Box>
            </Box>
          ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              background: `
                linear-gradient(90deg, #e0e0e0 1px, transparent 1px),
                linear-gradient(#e0e0e0 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography variant="body1" color="textSecondary">
                Brak dostępnego wideo
              </Typography>
              {jobDetails && (
                <Typography variant="caption" color="textSecondary">
                  Status: {(() => {
                    if (typeof jobDetails.status === 'object' && jobDetails.status !== null) {
                      // If status is an object, try to extract meaningful info
                      const statusObj = jobDetails.status as StatusObject;
                      return statusObj.status || statusObj.message || 'Processing';
                    }
                    return jobDetails.status || 'Unknown';
                  })()}
                </Typography>
              )}
          </Box>
          )}
        </Box>
      </Paper>


      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={!getCsvUrl()}
          onClick={() => {
            const csvUrl = getCsvUrl();
            if (csvUrl) {
              // Create a temporary link to download the CSV
              const link = document.createElement('a');
              link.href = csvUrl;
              link.download = `analysis-${id}-data.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
          sx={{
            backgroundColor: '#22D3BB',
            '&:hover': { backgroundColor: '#1bb5a3' },
            '&:disabled': {
              backgroundColor: '#cccccc',
              color: '#666666'
            },
          }}
        >
          Pobierz CSV
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={!getVideoUrl()}
          onClick={() => {
            const videoUrl = getVideoUrl();
            if (videoUrl) {
              // Create a temporary link to download the video
              const link = document.createElement('a');
              link.href = videoUrl;
              link.download = `analysis-${id}-video.mp4`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
          sx={{
            backgroundColor: '#22D3BB',
            '&:hover': { backgroundColor: '#1bb5a3' },
            '&:disabled': {
              backgroundColor: '#cccccc',
              color: '#666666'
            },
          }}
        >
          Pobierz wideo
        </Button>
      </Box>

      {/* Timeline Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon sx={{ color: '#22D3BB' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
              Linia czasowa
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedBodyPart}
              onChange={(e) => setSelectedBodyPart(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#22D3BB' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#22D3BB' },
              }}
            >
              {bodyParts.map((part) => (
                <MenuItem key={part.name_pl} value={part.name_pl}>
                  {part.name_pl}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AccessTimeIcon sx={{ color: '#666', fontSize: 16 }} />
          <Typography variant="body2" sx={{ color: '#666' }}>
            CZAS POMIARU
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
            4 min
          </Typography>
        </Box>

        {/* Line Chart */}
        <Box
          sx={{
            width: '100%',
            height: 300,
            backgroundColor: '#f8f9fa',
            borderRadius: 1,
            p: 2,
            position: 'relative',
          }}
        >
          {csvData.length === 0 ? (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: 1
            }}>
              <Typography variant="body1" color="textSecondary">
                {loadingCsv ? 'Ładowanie danych CSV...' : 'Brak danych CSV do wyświetlenia wykresu'}
              </Typography>
              {!loadingCsv && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const csvUrl = getCsvUrl();
                    if (csvUrl) {
                      downloadAndParseCsv(csvUrl);
                    }
                  }}
                >
                  Załaduj dane CSV
                </Button>
              )}
            </Box>
          ) : getAngleDataForBodyPart(selectedBodyPart).length === 0 ? (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              gap: 1
            }}>
              <Typography variant="body1" color="textSecondary">
                Brak danych kątów dla: {selectedBodyPart}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Oczekiwana kolumna: angle_{bodyParts.find(p => p.name_pl === selectedBodyPart)?.index}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Dostępne kolumny kątów: {getAvailableAngleColumns().join(', ') || 'Brak'}
              </Typography>
            </Box>
          ) : (
            <>
          <LineChart
                xAxis={[{
                  data: timelineData.xAxis,
                  scaleType: 'linear',
                  label: 'Klatki'
                }]}
                yAxis={[{
                  label: 'Kąt (°)'
                }]}
            series={timelineData.series}
            height={250}
            colors={['#22D3BB']}
            grid={{ horizontal: true, vertical: true }}
                margin={{ left: 60, right: 20, top: 20, bottom: 60 }}
              />

              {/* Chart info overlay */}
              <Box sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(255,255,255,0.9)',
                padding: 1,
                borderRadius: 1,
                fontSize: '0.75rem',
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="caption" display="block" fontWeight="bold">
                  {selectedBodyPart}
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  {getAngleDataForBodyPart(selectedBodyPart).length} punktów danych
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  Kolumna: angle_{bodyParts.find(p => p.name_pl === selectedBodyPart)?.index}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Left/Right Deviations Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ScheduleIcon sx={{ color: '#22D3BB' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
            Odchylenia lewa/prawa
          </Typography>
        </Box>

        {csvData.length === 0 ? (
          <Box sx={{
                display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
                flexDirection: 'column',
            gap: 1
          }}>
            <Typography variant="body1" color="textSecondary">
              {loadingCsv ? 'Ładowanie danych CSV...' : 'Brak danych CSV do analizy odchyleń'}
            </Typography>
            {!loadingCsv && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const csvUrl = getCsvUrl();
                  if (csvUrl) {
                    downloadAndParseCsv(csvUrl);
                  }
                }}
              >
                Załaduj dane CSV
              </Button>
            )}
          </Box>
        ) : getLeftRightDeviationData().length === 0 ? (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            flexDirection: 'column',
            gap: 1
          }}>
            <Typography variant="body1" color="textSecondary">
              Brak wystarczających danych do analizy odchyleń lewa/prawa
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Wymagane kolumny: {getAvailableAngleColumns().join(', ') || 'angle_0, angle_1, angle_2, ...'}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Comparison Bar Chart */}
            <Box sx={{
              width: '100%',
              height: 400,
              backgroundColor: '#f8f9fa',
              borderRadius: 1,
              p: 2,
              mb: 2
            }}>
              <BarChart
                xAxis={[{
                  scaleType: 'band',
                  data: deviationChartData.categories,
                  label: 'Części ciała'
                }]}
                yAxis={[{
                  label: 'Średni kąt (°)'
                }]}
                series={[
                  {
                    data: deviationChartData.leftSeries,
                    label: 'Lewa strona',
                    color: '#2196f3',
                  },
                  {
                    data: deviationChartData.rightSeries,
                    label: 'Prawa strona',
                    color: '#ff9800',
                  }
                ]}
                height={350}
                margin={{ left: 80, right: 20, top: 20, bottom: 80 }}
              />
              </Box>

            {/* Deviation Analysis */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Analiza odchyleń
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {getLeftRightDeviationData().map((item, index) => (
                <Box
                  key={index}
                  sx={{
                      p: 2,
                      backgroundColor: 'white',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                      minWidth: 200,
                      flex: '1 1 200px'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {item?.bodyPart}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      Lewa: {item?.leftAvg?.toFixed(1)}° (próbek: {item?.leftDataCount})
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                      Prawa: {item?.rightAvg?.toFixed(1)}° (próbek: {item?.rightDataCount})
                    </Typography>
                    <Typography
                      variant="caption"
                    sx={{
                        display: 'block',
                        fontWeight: 'bold',
                        color: (item?.deviation ?? 0) > 10 ? '#f44336' : (item?.deviation ?? 0) > 5 ? '#ff9800' : '#4caf50'
                      }}
                    >
                      Odchylenie: {item?.deviation?.toFixed(1)}°
                    </Typography>

                    {/* Visual deviation indicator */}
                    <Box sx={{ mt: 1, height: 20, position: 'relative', backgroundColor: '#f0f0f0', borderRadius: 1 }}>
                  <Box
                    sx={{
                      position: 'absolute',
                          left: 0,
                          top: 0,
                          width: `${Math.min((item?.deviation ?? 0 / 20) * 100, 100)}%`,
                          height: '100%',
                          backgroundColor: item?.deviation ?? 0 > 10 ? '#f44336' : item?.deviation ?? 0 > 5 ? '#ff9800' : '#4caf50',
                          borderRadius: 1,
                          transition: 'width 0.3s ease',
                        }}
                      />
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                          top: '50%',
                          left: 4,
                          transform: 'translateY(-50%)',
                          fontWeight: 'bold',
                          color: 'white',
                          fontSize: '10px'
                        }}
                      >
                        {item?.deviation?.toFixed(1)}°
                  </Typography>
                    </Box>
                </Box>
              ))}
              </Box>
            </Box>
          </>
        )}

        {/* Updated Summary Statistics */}
        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
                sx={{
                width: 12,
                height: 12,
                backgroundColor: '#2196f3',
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
              Lewa strona (średnia z wszystkich części)
              </Typography>
            </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: '#ff9800',
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
              Prawa strona (średnia z wszystkich części)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: '#22D3BB',
                borderRadius: '50%',
              }}
            />
            <Typography variant="body2" sx={{ color: '#22D3BB', fontWeight: 'bold' }}>
              Całkowite średnie odchylenie: {
                getLeftRightDeviationData().length > 0
                  ? (getLeftRightDeviationData().reduce((sum, item) => sum + (item?.deviation || 0), 0) / getLeftRightDeviationData().length).toFixed(1)
                  : '0'
              }°
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Download Report Button */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          size="large"
          onClick={downloadCompleteReport}
          disabled={downloadingReport}
          sx={{
            backgroundColor: '#22D3BB',
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': { backgroundColor: '#1bb5a3' },
            '&:disabled': { 
              backgroundColor: '#cccccc',
              color: '#666666'
            },
          }}
        >
          {downloadingReport ? 'Pobieranie...' : 'Pobierz raport z pomiaru'}
        </Button>
        
        <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', maxWidth: 600 }}>
          Pobierze: wideo analizy, dane CSV, raport odchyleń lewa/prawa oraz dane wykresów w formacie JSON
        </Typography>
      </Box>
    </Box>
  );
};



export default AnalysisDetail;