const fs = require('fs');

const devContent = fs.readFileSync('d:/hackathon/dev-connect/candidate-dashboard/src/integrations/supabase/types.ts', 'utf-8');
const uniContent = fs.readFileSync('d:/hackathon/unified-app/src/integrations/supabase/types.ts', 'utf-8');

const devTablesMatch = devContent.match(/Tables: \{\n([\s\S]*?)\n    \}\n    Views: \{/);
if (devTablesMatch) {
  const devTables = devTablesMatch[1];
  const newUniContent = uniContent.replace(/\n    \}\n    Views: \{/, ',\n' + devTables + '\n    }\n    Views: {');
  fs.writeFileSync('d:/hackathon/unified-app/src/integrations/supabase/types.ts', newUniContent);
  console.log('Successfully merged!');
} else {
  console.log('Failed to match Regex');
}
