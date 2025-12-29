import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading Component', () => {
  test('renders with default props', () => {
    render(<Loading />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    render(<Loading message="Идет загрузка..." />);
    expect(screen.getByText('Идет загрузка...')).toBeInTheDocument();
  });
});