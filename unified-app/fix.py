import os

replacements = [
    ('src/components/ATSResultModal.tsx', 'import { ATSResult }', 'import type { ATSResult }'),
    ('src/components/DashboardLayout.tsx', 'import { ReactNode }', 'import type { ReactNode }'),
    ('src/components/EditModal.tsx', 'import { useState, ReactNode }', 'import { useState } from "react";\nimport type { ReactNode }'),
    ('src/components/NavLink.tsx', 'import { Link, useLocation, NavLinkProps }', 'import { Link, useLocation } from "react-router-dom";\nimport type { NavLinkProps }'),
    ('src/components/ResumePreviewModal.tsx', 'import { ResumeData }', 'import type { ResumeData }'),
    ('src/components/ui/form.tsx', 'import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext }', 'import { Controller, FormProvider, useFormContext } from "react-hook-form";\nimport type { ControllerProps, FieldPath, FieldValues }'),
    ('src/components/ui/pagination.tsx', 'import { ButtonProps, buttonVariants }', 'import { buttonVariants } from "@/components/ui/button";\nimport type { ButtonProps }'),
    ('src/components/ui/sidebar.tsx', 'import { VariantProps, cva }', 'import { cva } from "class-variance-authority";\nimport type { VariantProps }'),
    ('src/contexts/AuthContext.tsx', 'import { createContext, useContext, useEffect, useState, ReactNode }', 'import { createContext, useContext, useEffect, useState } from "react";\nimport type { ReactNode }'),
    ('src/hooks/useCompanyATSAnalysis.ts', 'import { ATSResult }', 'import type { ATSResult }'),
    ('src/hooks/useCompanyResumeGeneration.ts', 'import { ResumeData }', 'import type { ResumeData }'),
    ('src/hooks/useRanking.ts', 'import { JobRankRequest, JobRankResponse }', 'import type { JobRankRequest, JobRankResponse }')
]

for file_path, old_str, new_str in replacements:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace(old_str, new_str)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Imports updated successfully")
