import React from 'react';
import styled from 'styled-components';
import { ReactNode } from 'react';
import Link from 'next/link';

interface ButtonProps {
  text: string;
  link: string;
  icon?: ReactNode;
}

const ButtonComponent: React.FC<ButtonProps> = ({ text, link, icon }) => {
  return (
    <StyledWrapper>
      <Link href={link} passHref>
        <div className="button">
          {icon && <span style={{ marginRight: '5px' }}>{icon}</span>}
          <div className="box">{text.split('')[0]}</div>
          <div className="box">{text.split('')[1]}</div>
          <div className="box">{text.split('')[2]}</div>
          <div className="box">{text.split('')[3]}</div>
          <div className="box">{text.split('')[4] || ''}</div>
          <div className="box">{text.split('')[5] || ''}</div>
          <div className="box">{text.split('')[6] || ''}</div>
          <div className="box">{text.split('')[7] || ''}</div>
          <div className="box">{text.split('')[8] || ''}</div>
          <div className="box">{text.split('')[9] || ''}</div>
          <div className="box">{text.split('')[10] || ''}</div>
        </div>
      </Link>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    display: flex;
    text-decoration: none;
  }

  .box {
    width: 30px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    transition: all 0.8s;
    cursor: pointer;
    position: relative;
    background: #000;
    overflow: hidden;
    border: none;
    padding: 0 5px;
  }

  .box:before {
    content: 'D';
    position: absolute;
    top: 0;
    background: #333;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateY(100%);
    transition: transform 0.4s;
    color: #fff;
  }

  .box:nth-child(2)::before {
    transform: translateY(-100%);
    content: 'O';
  }

  .box:nth-child(3)::before {
    content: 'N';
  }

  .box:nth-child(4)::before {
    transform: translateY(-100%);
    content: 'A';
  }

  .box:nth-child(5)::before {
    content: 'T';
  }

  .box:nth-child(6)::before {
    transform: translateY(-100%);
    content: 'E';
  }

  .box:nth-child(7)::before {
    content: ' ';
  }

  .box:nth-child(8)::before {
    transform: translateY(-100%);
    content: 'N';
  }

  .box:nth-child(9)::before {
    content: 'O';
  }

  .box:nth-child(10)::before {
    transform: translateY(-100%);
    content: 'W';
  }

  .box:nth-child(11)::before {
    content: 'V';
  }

  .box:nth-child(12)::before {
    transform: translateY(-100%);
    content: 'I';
  }

  .box:nth-child(13)::before {
    content: 'E';
  }

  .box:nth-child(14)::before {
    transform: translateY(-100%);
    content: 'W';
  }

  .box:nth-child(15)::before {
    content: ' ';
  }

  .box:nth-child(16)::before {
    transform: translateY(-100%);
    content: 'D';
  }

  .box:nth-child(17)::before {
    content: 'O';
  }

  .box:nth-child(18)::before {
    transform: translateY(-100%);
    content: 'N';
  }

  .box:nth-child(19)::before {
    content: 'A';
  }

  .box:nth-child(20)::before {
    transform: translateY(-100%);
    content: 'T';
  }

  .box:nth-child(21)::before {
    content: 'I';
  }

  .box:nth-child(22)::before {
    transform: translateY(-100%);
    content: 'O';
  }

  .box:nth-child(23)::before {
    content: 'N';
  }

  .box:nth-child(24)::before {
    transform: translateY(-100%);
    content: 'S';
  }

  .button:hover .box:before {
    transform: translateY(0);
  }
`;

export default ButtonComponent;