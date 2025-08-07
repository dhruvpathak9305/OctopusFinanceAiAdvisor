import { renderHook, act } from '@testing-library/react';
import { useAccountSelection, AccountData } from '../hooks/useAccountSelection';

const mockAccount: AccountData = {
  id: '1',
  name: 'Test Account',
  accountName: 'Test Account',
  value: 100000,
  percentage: 50,
  institution: 'Test Bank',
  color: '#FF0000',
};

const anotherAccount: AccountData = {
  id: '2',
  name: 'Another Account',
  accountName: 'Another Account',
  value: 50000,
  percentage: 25,
  institution: 'Another Bank',
  color: '#00FF00',
};

describe('useAccountSelection', () => {
  it('should initialize with no selected account', () => {
    const { result } = renderHook(() => useAccountSelection());

    expect(result.current.selectedAccount).toBe(null);
    expect(result.current.isSelected('1')).toBe(false);
  });

  it('should select an account', () => {
    const { result } = renderHook(() => useAccountSelection());

    act(() => {
      result.current.selectAccount(mockAccount);
    });

    expect(result.current.selectedAccount).toEqual(mockAccount);
    expect(result.current.isSelected('1')).toBe(true);
  });

  it('should deselect account when clicking the same account again', () => {
    const { result } = renderHook(() => useAccountSelection());

    act(() => {
      result.current.selectAccount(mockAccount);
    });

    expect(result.current.selectedAccount).toEqual(mockAccount);

    act(() => {
      result.current.selectAccount(mockAccount);
    });

    expect(result.current.selectedAccount).toBe(null);
    expect(result.current.isSelected('1')).toBe(false);
  });

  it('should switch selection to different account', () => {
    const { result } = renderHook(() => useAccountSelection());

    act(() => {
      result.current.selectAccount(mockAccount);
    });

    expect(result.current.selectedAccount).toEqual(mockAccount);
    expect(result.current.isSelected('1')).toBe(true);

    act(() => {
      result.current.selectAccount(anotherAccount);
    });

    expect(result.current.selectedAccount).toEqual(anotherAccount);
    expect(result.current.isSelected('1')).toBe(false);
    expect(result.current.isSelected('2')).toBe(true);
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useAccountSelection());

    act(() => {
      result.current.selectAccount(mockAccount);
    });

    expect(result.current.selectedAccount).toEqual(mockAccount);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedAccount).toBe(null);
    expect(result.current.isSelected('1')).toBe(false);
  });

  it('should handle multiple rapid clicks', () => {
    const { result } = renderHook(() => useAccountSelection());

    // Rapid clicks on same account
    act(() => {
      result.current.selectAccount(mockAccount);
      result.current.selectAccount(mockAccount);
      result.current.selectAccount(mockAccount);
    });

    expect(result.current.selectedAccount).toEqual(mockAccount);

    // Rapid clicks on different accounts
    act(() => {
      result.current.selectAccount(anotherAccount);
      result.current.selectAccount(mockAccount);
      result.current.selectAccount(anotherAccount);
    });

    expect(result.current.selectedAccount).toEqual(anotherAccount);
  });
}); 