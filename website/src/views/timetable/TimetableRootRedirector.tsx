import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { State } from 'types/state';
import { timetablePage } from 'views/routes/paths';

const TimetableRootRedirector: React.FC = () => {
  const navigate = useNavigate();
  const activeSemester = useSelector((state: State) => state.app.activeSemester);

  useEffect(() => {
    navigate(timetablePage(activeSemester));
  }, [activeSemester, navigate]);

  return null;
};

export default TimetableRootRedirector;
