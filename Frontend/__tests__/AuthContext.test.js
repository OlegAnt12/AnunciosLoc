import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { authService } from '../src/services/api';

jest.mock('../src/services/api');

const TestConsumer = () => {
  const { user, isAuthenticated, login } = useAuth();
  return (
    <>
      <>{String(!!user)}</>
      <>{String(isAuthenticated)}</>
      <button onClick={() => login({ username: 'u', password: 'p' })} testID="login">login</button>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => jest.resetAllMocks());

  test('login normalizes nested user payload', async () => {
    authService.login.mockResolvedValue({ success: true, data: { user: { id: 1, username: 'tester' }, token: 'abc' } });

    let getByText;

    await act(async () => {
      ({ getByText } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      ));
    });

    expect(getByText('false')).toBeTruthy();

    await act(async () => {
      const btn = getByText('login');
      btn.props.onClick();
    });

    expect(getByText('true')).toBeTruthy();
  });
});
