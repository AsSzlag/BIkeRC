import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Autocomplete,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { type JobMetadata } from '../services/JobMetadataService';
import jobMetadataService from '../services/JobMetadataService';

interface JobMetadataFormProps {
  job_id: string;
  type: 'analysis' | 'measurement';
  onMetadataChange: (metadata: Partial<JobMetadata>) => void;
  initialData?: Partial<JobMetadata>;
}

const JobMetadataForm: React.FC<JobMetadataFormProps> = ({
  job_id,
  type,
  onMetadataChange,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<Partial<JobMetadata>>({
    job_id,
    type,
    name: '',
    rower: '',
    description: '',
    tags: [],
    client_info: {
      age: undefined,
      height: undefined,
      weight: undefined,
      experience_level: undefined,
    },
    bike_info: {
      brand: '',
      model: '',
      size: '',
      year: undefined,
    },
    session_info: {
      duration: undefined,
      location: '',
      weather: '',
      notes: '',
    },
    ...initialData
  });

  // Get existing rowers for autocomplete
  const existingRowers = jobMetadataService.getUniqueRowers();

  // Common bike brands for autocomplete
  const bikeBrands = [
    'Trek', 'Giant', 'Specialized', 'Cannondale', 'Scott', 'Merida', 'Cube',
    'Bianchi', 'Pinarello', 'Colnago', 'Cervélo', 'BMC', 'Orbea', 'Ridley',
    'Focus', 'Canyon', 'Rose', 'Stevens', 'Kross', 'Author'
  ];

  // Common tags for suggestions
  const commonTags = [
    'trening', 'wyścig', 'test', 'rehabilitacja', 'dopasowanie', 'analiza postawy',
    'biomechanika', 'wydajność', 'komfort', 'ból', 'ustawienia', 'nowy rower'
  ];

  const handleFieldChange = (field: string, value: any) => {
    const updatedData = { ...formData };
    
    // Handle nested fields
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedData[parent as keyof JobMetadata] = {
        ...updatedData[parent as keyof JobMetadata],
        [child]: value
      };
    } else {
      updatedData[field as keyof JobMetadata] = value;
    }
    
    setFormData(updatedData);
    onMetadataChange(updatedData);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        Informacje o {type === 'analysis' ? 'analizie' : 'pomiarze'}
      </Typography>

      {/* Basic Information */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Nazwa analizy/pomiaru *"
          value={formData.name || ''}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder={`${type === 'analysis' ? 'Analiza' : 'Pomiar'} - ${new Date().toLocaleDateString('pl-PL')}`}
          required
        />
        <Autocomplete
          fullWidth
          freeSolo
          options={existingRowers}
          value={formData.rower || ''}
          onInputChange={(_, value) => handleFieldChange('rower', value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Rower/Klient *"
              placeholder="Imię i nazwisko"
              required
            />
          )}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={2}
        label="Opis (opcjonalny)"
        value={formData.description || ''}
        onChange={(e) => handleFieldChange('description', e.target.value)}
        placeholder="Krótki opis celu analizy/pomiaru..."
        sx={{ mb: 3 }}
      />

      <Autocomplete
        multiple
        freeSolo
        options={commonTags}
        value={formData.tags || []}
        onChange={(_, value) => handleFieldChange('tags', value)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tagi"
            placeholder="Dodaj tagi..."
          />
        )}
        sx={{ mb: 3 }}
      />

      {/* Advanced Information */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Informacje o kliencie
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              type="number"
              label="Wiek"
              value={formData.client_info?.age || ''}
              onChange={(e) => handleFieldChange('client_info.age', e.target.value ? parseInt(e.target.value) : undefined)}
              InputProps={{ inputProps: { min: 1, max: 120 } }}
            />
            <TextField
              type="number"
              label="Wzrost (cm)"
              value={formData.client_info?.height || ''}
              onChange={(e) => handleFieldChange('client_info.height', e.target.value ? parseInt(e.target.value) : undefined)}
              InputProps={{ inputProps: { min: 100, max: 250 } }}
            />
            <TextField
              type="number"
              label="Waga (kg)"
              value={formData.client_info?.weight || ''}
              onChange={(e) => handleFieldChange('client_info.weight', e.target.value ? parseInt(e.target.value) : undefined)}
              InputProps={{ inputProps: { min: 30, max: 200 } }}
            />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Poziom doświadczenia</InputLabel>
            <Select
              value={formData.client_info?.experience_level || ''}
              onChange={(e) => handleFieldChange('client_info.experience_level', e.target.value)}
              label="Poziom doświadczenia"
            >
              <MenuItem value="beginner">Początkujący</MenuItem>
              <MenuItem value="intermediate">Średniozaawansowany</MenuItem>
              <MenuItem value="advanced">Zaawansowany</MenuItem>
              <MenuItem value="professional">Profesjonalny</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Informacje o rowerze
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Autocomplete
              fullWidth
              freeSolo
              options={bikeBrands}
              value={formData.bike_info?.brand || ''}
              onInputChange={(_, value) => handleFieldChange('bike_info.brand', value)}
              renderInput={(params) => (
                <TextField {...params} label="Marka roweru" />
              )}
            />
            <TextField
              fullWidth
              label="Model"
              value={formData.bike_info?.model || ''}
              onChange={(e) => handleFieldChange('bike_info.model', e.target.value)}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Rozmiar"
              value={formData.bike_info?.size || ''}
              onChange={(e) => handleFieldChange('bike_info.size', e.target.value)}
              placeholder="np. M, 56cm"
            />
            <TextField
              type="number"
              label="Rok produkcji"
              value={formData.bike_info?.year || ''}
              onChange={(e) => handleFieldChange('bike_info.year', e.target.value ? parseInt(e.target.value) : undefined)}
              InputProps={{ inputProps: { min: 1980, max: new Date().getFullYear() + 1 } }}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Informacje o sesji
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              type="number"
              label="Czas trwania (min)"
              value={formData.session_info?.duration || ''}
              onChange={(e) => handleFieldChange('session_info.duration', e.target.value ? parseInt(e.target.value) : undefined)}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              fullWidth
              label="Lokalizacja"
              value={formData.session_info?.location || ''}
              onChange={(e) => handleFieldChange('session_info.location', e.target.value)}
              placeholder="np. Studio BikeRC, Warszawa"
            />
          </Box>
          <TextField
            fullWidth
            label="Warunki/Pogoda"
            value={formData.session_info?.weather || ''}
            onChange={(e) => handleFieldChange('session_info.weather', e.target.value)}
            placeholder="np. Słonecznie, 20°C"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Dodatkowe notatki"
            value={formData.session_info?.notes || ''}
            onChange={(e) => handleFieldChange('session_info.notes', e.target.value)}
            placeholder="Dodatkowe informacje o sesji..."
          />
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default JobMetadataForm;
