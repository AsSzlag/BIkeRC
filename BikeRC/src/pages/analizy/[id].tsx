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
  const [corsMode, setCorsMode] = useState<'use-credentials' | 'anonymous' | ''>('anonymous');
  const [cachedVideoUrl, setCachedVideoUrl] = useState<string | null>(null);
  const [downloadingVideo, setDownloadingVideo] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
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

  // Test if video URL is accessible
  const testVideoUrl = async (videoUrl: string) => {
    try {
      console.log('Testing video URL accessibility:', videoUrl);
      console.log('Testing with CORS mode:', corsMode);

      // Try without credentials first (since server uses wildcard CORS)
      const response = await fetch(videoUrl, {
        method: 'HEAD', // Just check headers, don't download content
        mode: 'cors',
        // Don't send Authorization header for anonymous requests
        ...(corsMode === 'use-credentials' && {
          credentials: 'include',
          headers: {
            'Authorization': localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')}` : '',
          },
        })
      });

      console.log('Video URL test result:', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        corsMode: corsMode
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('video/')) {
          console.log('Video URL is accessible and has video content type');
          return true;
        } else {
          console.log('URL accessible but not video content:', contentType);
          return false;
        }
      } else {
        console.log('Video URL not accessible:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error testing video URL:', error);
      return false;
    }
  };

  // IndexedDB functions for video caching
  const openVideoCache = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('VideoCache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'id' });
        }
      };
    });
  };

  const getCachedVideo = async (videoId: string): Promise<Blob | null> => {
    try {
      const db = await openVideoCache();
      const transaction = db.transaction(['videos'], 'readonly');
      const store = transaction.objectStore('videos');

      return new Promise((resolve, reject) => {
        const request = store.get(videoId);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.blob : null);
        };
      });
    } catch (error) {
      console.error('Error getting cached video:', error);
      return null;
    }
  };

  const cacheVideo = async (videoId: string, blob: Blob): Promise<void> => {
    try {
      const db = await openVideoCache();
      const transaction = db.transaction(['videos'], 'readwrite');
      const store = transaction.objectStore('videos');

      await new Promise<void>((resolve, reject) => {
        const request = store.put({ id: videoId, blob, timestamp: Date.now() });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      console.log('Video cached successfully');
    } catch (error) {
      console.error('Error caching video:', error);
    }
  };

  // Download and cache video
  const downloadAndCacheVideo = async (videoUrl: string, videoId: string) => {
    try {
      setDownloadingVideo(true);
      setDownloadProgress(0);
      console.log('Downloading video for caching:', videoUrl);

      // Check if already cached
      const cachedBlob = await getCachedVideo(videoId);
      if (cachedBlob) {
        console.log('Video already cached, using cached version');
        const blobUrl = URL.createObjectURL(cachedBlob);
        setCachedVideoUrl(blobUrl);
        setDownloadingVideo(false);
        return;
      }

      const response = await fetch(videoUrl, {
        method: 'GET',
        mode: 'cors',
        ...(corsMode === 'use-credentials' && {
          credentials: 'include',
          headers: {
            'Authorization': localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')}` : '',
          },
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (total > 0) {
          const progress = Math.round((loaded / total) * 100);
          setDownloadProgress(progress);
        }
      }

      // Combine chunks into single blob
      const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
      console.log('Video downloaded, size:', blob.size, 'bytes');

      // Cache the video
      await cacheVideo(videoId, blob);

      // Create blob URL for playback
      const blobUrl = URL.createObjectURL(blob);
      setCachedVideoUrl(blobUrl);

    } catch (error) {
      console.error('Error downloading video:', error);
      setVideoError(true);
    } finally {
      setDownloadingVideo(false);
    }
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
        ...(corsMode === 'use-credentials' && {
          credentials: 'include',
          headers: {
            'Authorization': localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')}` : '',
          },
        })
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

  // Check video file format and content
  const checkVideoFileFormat = async (videoUrl: string) => {
    try {
      console.log('Checking video file format for:', videoUrl);

      const response = await fetch(videoUrl, {
        method: 'GET',
        headers: {
          'Range': 'bytes=0-1023', // Get first 1KB to check file signature
        },
        mode: 'cors',
        ...(corsMode === 'use-credentials' && {
          credentials: 'include',
          headers: {
            'Authorization': localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')}` : '',
            'Range': 'bytes=0-1023',
          },
        })
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Check file signature (magic bytes)
        const signature = Array.from(uint8Array.slice(0, 12))
          .map(b => b.toString(16).padStart(2, '0'))
          .join(' ');

        console.log('File signature (first 12 bytes):', signature);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('Content-Length:', response.headers.get('content-length'));

        // Check for common video file signatures
        const signatureStr = signature.replace(/\s/g, '');
        if (signatureStr.startsWith('000000')) {
          if (signatureStr.includes('6674797069736f6d') || signatureStr.includes('66747970')) {
            console.log('Detected: MP4/MOV container');
          } else if (signatureStr.includes('6674797033677035')) {
            console.log('Detected: 3GP container');
          } else {
            console.log('Detected: Unknown container with ftyp box');
          }
        } else if (signatureStr.startsWith('1a45dfa3')) {
          console.log('Detected: WebM/MKV container');
        } else if (signatureStr.startsWith('4f676753')) {
          console.log('Detected: OGG container');
        } else if (signatureStr.startsWith('52494646')) {
          console.log('Detected: AVI container');
        } else {
          console.log('Unknown file format - might not be a video file');
          console.log('First 32 bytes as text:', new TextDecoder('utf-8', { fatal: false }).decode(uint8Array.slice(0, 32)));
        }
      }
    } catch (error) {
      console.error('Error checking video file format:', error);
    }
  };

  // Auto-load cached video or start caching when job details are loaded
  useEffect(() => {
    const videoUrl = getVideoUrl();
    if (videoUrl && id && !cachedVideoUrl && !downloadingVideo) {
      // First check if video is already cached
      getCachedVideo(id).then(cachedBlob => {
        if (cachedBlob) {
          console.log('Found cached video, using it');
          const blobUrl = URL.createObjectURL(cachedBlob);
          setCachedVideoUrl(blobUrl);
        } else {
          // If not cached, test URL accessibility
          testVideoUrl(videoUrl).then(isAccessible => {
            if (isAccessible) {
              // If accessible, automatically start caching
              console.log('Video accessible, starting automatic caching');
              downloadAndCacheVideo(videoUrl, id);
            } else {
              console.log('Video URL is not accessible, showing error state');
              setVideoError(true);
            }
          });
        }
      });
    }
  }, [jobDetails, id, cachedVideoUrl, downloadingVideo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (cachedVideoUrl) {
        URL.revokeObjectURL(cachedVideoUrl);
      }
    };
  }, [cachedVideoUrl]);



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
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5 }}>
            12/10.09.2025
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            Szczegóły pomiaru
          </Typography>
        </Box>
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
          ) : downloadingVideo ? (
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
                Pobieranie wideo do pamięci lokalnej...
              </Typography>
              <Box sx={{ width: '80%', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 8,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${downloadProgress}%`,
                      height: '100%',
                      backgroundColor: '#22D3BB',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ minWidth: 40 }}>
                  {downloadProgress}%
                </Typography>
              </Box>
            </Box>
          ) : cachedVideoUrl ? (
            <video
              controls
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                console.error('Cached video error:', e);
                setVideoError(true);
              }}
              onLoadedMetadata={() => {
                console.log('Cached video loaded successfully');
              }}
              src={cachedVideoUrl}
            >
              Twoja przeglądarka nie obsługuje odtwarzania wideo.
            </video>
          ) : getVideoUrl() ? (
            <video
              controls
              crossOrigin={corsMode || undefined}
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

                // MediaError codes:
                // 1 = MEDIA_ERR_ABORTED - playback aborted
                // 2 = MEDIA_ERR_NETWORK - network error
                // 3 = MEDIA_ERR_DECODE - decode error (like DEMUXER_ERROR_NO_SUPPORTED_STREAMS)
                // 4 = MEDIA_ERR_SRC_NOT_SUPPORTED - format not supported

                if (video.error?.code === 3) {
                  console.log('Video decode error - possibly unsupported codec or corrupted file');
                  // Try to fetch file info to debug
                  checkVideoFileFormat(video.currentSrc);
                } else if (video.error?.code === 4) {
                  console.log('Video format not supported or authentication required');
                }

                setVideoError(true);
              }}
              onLoadStart={() => {
                console.log('Video loading started for:', 'https://api-mo2s.netrix.com.pl/api/download/video/44f87db2-175e-4043-a635-a3d72babde44');
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
              }}
              onCanPlayThrough={() => {
                console.log('Video can play through without buffering');
              }}
              onPlay={() => {
                console.log('Video started playing');
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
                Problem z formatem wideo
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mb: 2 }}>
                Wideo nie może być odtworzone - możliwe problemy: nieobsługiwany kodek, uszkodzony plik,
                lub problem z CORS. Sprawdź konsolę dla szczegółów lub pobierz wideo lokalnie.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setCorsMode('use-credentials');
                    setVideoError(false);
                  }}
                  sx={{
                    borderColor: corsMode === 'use-credentials' ? '#22D3BB' : '#ccc',
                    color: corsMode === 'use-credentials' ? '#22D3BB' : '#666',
                    backgroundColor: corsMode === 'use-credentials' ? '#f0fffe' : 'transparent',
                  }}
                >
                  CORS: Credentials
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setCorsMode('anonymous');
                    setVideoError(false);
                  }}
                  sx={{
                    borderColor: corsMode === 'anonymous' ? '#22D3BB' : '#ccc',
                    color: corsMode === 'anonymous' ? '#22D3BB' : '#666',
                    backgroundColor: corsMode === 'anonymous' ? '#f0fffe' : 'transparent',
                  }}
                >
                  CORS: Anonymous
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setCorsMode('');
                    setVideoError(false);
                  }}
                  sx={{
                    borderColor: corsMode === '' ? '#22D3BB' : '#ccc',
                    color: corsMode === '' ? '#22D3BB' : '#666',
                    backgroundColor: corsMode === '' ? '#f0fffe' : 'transparent',
                  }}
                >
                  No CORS
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    const videoUrl = getVideoUrl();
                    if (videoUrl && id) {
                      downloadAndCacheVideo(videoUrl, id);
                    }
                  }}
                  sx={{
                    backgroundColor: '#22D3BB',
                    '&:hover': { backgroundColor: '#1bb5a3' },
                  }}
                >
                  Pobierz do pamięci lokalnej
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    const videoUrl = getVideoUrl();
                    if (videoUrl) {
                      checkVideoFileFormat(videoUrl);
                    }
                  }}
                  sx={{
                    borderColor: '#ff9800',
                    color: '#ff9800',
                    '&:hover': { borderColor: '#f57c00', backgroundColor: '#fff8e1' },
                  }}
                >
                  Sprawdź format pliku
                </Button>
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