/**
 * CLSI Breakpoint Reference Data
 * Used to classify AST results as Susceptible (S), Intermediate (I), or Resistant (R)
 * Source: CLSI M100 guidelines (simplified subset for MVP)
 */
const CLSI_BREAKPOINTS = {
  'E. coli': {
    'Ampicillin':        { S: 8,   R: 32  },
    'Ciprofloxacin':     { S: 1,   R: 4   },
    'Ceftriaxone':       { S: 1,   R: 4   },
    'Gentamicin':        { S: 4,   R: 16  },
    'Trimethoprim-SMX':  { S: 2,   R: 8   },
  },
  'S. aureus': {
    'Oxacillin':         { S: 2,   R: 4   },
    'Vancomycin':        { S: 2,   R: 16  },
    'Clindamycin':       { S: 0.5, R: 4   },
    'Erythromycin':      { S: 0.5, R: 8   },
    'Tetracycline':      { S: 4,   R: 16  },
  },
  'K. pneumoniae': {
    'Meropenem':         { S: 1,   R: 4   },
    'Imipenem':          { S: 1,   R: 4   },
    'Ceftazidime':       { S: 4,   R: 16  },
    'Amikacin':          { S: 16,  R: 64  },
    'Piperacillin-TZB':  { S: 16,  R: 128 },
  },
};

/**
 * Classify MIC value against CLSI breakpoints
 * @param {string} pathogen
 * @param {string} antibiotic
 * @param {number} mic - Minimum Inhibitory Concentration
 * @returns {'S'|'I'|'R'|'Unknown'}
 */
const classifyMIC = (pathogen, antibiotic, mic) => {
  const bp = CLSI_BREAKPOINTS[pathogen]?.[antibiotic];
  if (!bp) return 'Unknown';
  if (mic <= bp.S) return 'S';
  if (mic >= bp.R) return 'R';
  return 'I';
};

module.exports = { CLSI_BREAKPOINTS, classifyMIC };
