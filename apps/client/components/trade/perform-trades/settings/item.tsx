import { useState, useRef } from 'react';
import { useMotionValue, Reorder, useDragControls } from 'framer-motion';
import { useRaisedShadow } from './use-raised-shadow';
import { ReorderIcon } from './icon';

interface Props {
  item: {
    id: number;
    name: string;
    width: string;
  };
  visible: {
    id: number;
    name: string;
    width: string;
  }[];
  hidden: {
    id: number;
    name: string;
    width: string;
  }[];
  setVisible: any;
  setHidden: any;
  inside: 'visible' | 'hidden';
}

export const Item = ({
  item,
  visible,
  hidden,
  setVisible,
  setHidden,
  inside,
}: Props) => {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  const dragControls = useDragControls();
  const isDragging = useRef(false);
  return (
    <Reorder.Item
      value={item}
      onDragStart={() => {
        isDragging.current = true;
      }}
      onDragEnd={(val) => {
        isDragging.current = false;
      }}
      onClick={() => {
        // console.log(inside , isDragging.current)
        if (inside === 'hidden' && !isDragging.current) {
          setVisible([item, ...visible]);
          setHidden(hidden.filter((a) => a !== item));
        } else if (inside === 'visible' && !isDragging.current) {
          setHidden([item, ...hidden]);
          setVisible(visible.filter((a) => a !== item));
        }
      }}
      id={String(item.id)}
      className="flex px-2 noselect hover:bg-[var(--primary-shade-d)] hover:border-l-[2px] hover:pl-[10px] border-[var(--primary-shade-b)] pl-[12px] py-2 justify-between cursor-pointer items-center"
      style={{ boxShadow, y }}
      dragListener={false}
      dragControls={dragControls}
    >
      {item.name}
      <ReorderIcon dragControls={dragControls} />
    </Reorder.Item>
  );
};
