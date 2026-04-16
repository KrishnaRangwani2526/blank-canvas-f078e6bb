#!/usr/bin/env python3
"""
seed_supabase.py — Seed test data into Supabase for testing.
"""

import os
from supabase import create_client

# Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://zzmtbeitrrjxukmtyvuf.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6bXRiZWl0cnJqeHVrbXR5dnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwOTU1NTAsImV4cCI6MjA5MTY3MTU1MH0.glBDg4pvoyHez3E_O7FVOSZ1CN5LJezLWqtaeHmmKFA")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def seed_skills():
    """Add some test skills to existing profiles."""

    # Get existing profiles
    profiles_response = supabase.table('profiles').select('user_id, full_name').execute()
    profiles = profiles_response.data or []

    print(f"Found {len(profiles)} profiles")

    # Sample skills data
    skills_data = [
        ("b8219687-d0ec-4796-995e-0fbaeaf0694d", ["Python", "React", "JavaScript", "Node.js"]),
        ("9dbfdf14-300a-465b-acba-53fbcb1f3a3e", ["Python", "Machine Learning", "SQL", "TensorFlow"]),
    ]

    for user_id, skills in skills_data:
        print(f"Adding skills for user {user_id}: {skills}")
        for skill_name in skills:
            try:
                supabase.table('skills').insert({
                    'user_id': user_id,
                    'name': skill_name
                }).execute()
            except Exception as e:
                print(f"Error adding skill {skill_name}: {e}")

    print("Seeding complete!")

if __name__ == "__main__":
    seed_skills()