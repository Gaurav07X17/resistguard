# ResistGuard Setup Progress

## Current Plan Steps:
- [x] Step 1: Install backend dependencies (`npm --prefix backend install`) ✅
- [ ] Step 2: Install frontend dependencies (`npm --prefix frontend install`) 
- [ ] Step 3: Confirm backend/.env has correct MONGO_URI and JWT_SECRET (check with cat backend/.env)
- [ ] Step 4: User confirm MongoDB Atlas → Network Access → Add IP 0.0.0.0/0
- [ ] Step 5: Seed database (`npm --prefix backend run seed`)
- [ ] Step 6: Start backend server (`npm --prefix backend run dev`)
- [ ] Step 7: Start frontend (`npm --prefix frontend start`)
- [ ] Step 8: Test at http://localhost:3000 (login: researcher@demo.com / password123)

**Note:** After each step, check terminal output. If Mongo errors, focus on Step 4.
