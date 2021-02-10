import { useLayoutEffect, useState } from 'react';
import { getSSOLink } from 'apis/mpe';
import ModuleFormBeforeSignIn from './ModuleFormBeforeSignIn';
import ModuleForm from './ModuleForm';
import { NUS_AUTH_TOKEN } from '../../storage/keys';

// This should probably take in the array containing the modules the person choose yeet
type Props = {
  isLoggedIn: boolean;
};

const MpeForm: React.FC<Props> = (props) => {
  async function signIn() {
    try {
      window.location.replace(await getSSOLink());
    } catch (err) {
      // Handle Error
    }
  }

  // useLayoutEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   setToken(urlParams.get('token'));
  //   if (token) {
  //     setIsLoggedIn(true);
  //   }
  // }, [token]);

  return (
    <div> {props.isLoggedIn ? <ModuleForm /> : <ModuleFormBeforeSignIn onClick={signIn} />}</div>
  );
};

export default MpeForm;
