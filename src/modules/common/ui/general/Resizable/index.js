import React, {
  Children, cloneElement, useCallback, useEffect, useRef, useState,
} from 'react';
import classNames from 'classnames';
import { ResizeObserver as Polyfill } from '@juggle/resize-observer';
import clamp from 'lodash/clamp';

import { useRefCallback } from '@common/hooks';
import Section from './Section';

const ResizeObserver = window.ResizeObserver || Polyfill;

const DEFAULT_MIN_SECTION_SIZE = 50;

function Resizable({
  className,
  children: _children,
  dividerClassName,
  dividerWidth = 0,
  vertical = false,
  minSectionSize = DEFAULT_MIN_SECTION_SIZE,
  onChange,
  onDragStart,
  onDragEnd,
  sizes,
  sections = [],
  ...remainingProps
}) {
  const ref = useRef(null);
  const [internalSizes, setInternalSizes] = useState({});

  function isNullOrUndefined(item) {
    return item === null || item === undefined;
  }

  const children = Children.toArray(_children).filter(o => Boolean(o));

  const getMaxSize = useCallback((child) => (
    isNullOrUndefined(child.props.maxSize)
      ? Number.MAX_SAFE_INTEGER
      : child.props.maxSize
  ), []);

  const getMinSize = useCallback((child) => (
    isNullOrUndefined(child.props.minSize)
      ? Math.min(minSectionSize, getMaxSize(child))
      : child.props.minSize
  ), [minSectionSize, getMaxSize]);

  const normalize = useCallback((newSize, index) => {
    const minSize = getMinSize(children[index]);
    const maxSize = getMaxSize(children[index]);
    const size = clamp(newSize, minSize, maxSize);
    return size;
  }, [children, getMaxSize, getMinSize]);

  const updateSizes = useCallback((newSizes) => {
    if (onChange) {
      onChange(newSizes);
    }

    setInternalSizes(newSizes);
  }, [onChange]);

  const handleSizeChange = useCallback((size, index) => {
    const newSizes = { ...internalSizes };
    newSizes[index] = normalize(size, index);

    if (index + 1 < children.length && internalSizes[index + 1] !== null) {
      const nextSectionSize = internalSizes[index + 1] + internalSizes[index];
      newSizes[index + 1] = nextSectionSize - newSizes[index];
      if (normalize(newSizes[index + 1], index + 1) !== newSizes[index + 1]) {
        return;
      }
    }

    updateSizes(newSizes);
  }, [internalSizes, normalize, children.length, updateSizes]);

  const initializeSize = useCallback(() => {
    const newSizes = {};
    const allocatedChildrens = {};
    let unallocatedChildren = children.length;
    let availableSpace = vertical
      ? ref.current?.offsetHeight
      : ref.current?.offsetWidth;

    availableSpace -= dividerWidth * (unallocatedChildren - 1);

    children.forEach((child, index) => {
      const { initialSize } = child.props;
      if (initialSize || initialSize === 0) {
        unallocatedChildren -= 1;
        newSizes[index] = initialSize;
        availableSpace -= initialSize;
        allocatedChildrens[index] = true;
      }
    });

    children.forEach((child, index) => {
      const averageSpace = Math.max(availableSpace / unallocatedChildren, 0.1);

      if (!allocatedChildrens[index]) {
        newSizes[index] = averageSpace;
        availableSpace -= averageSpace;
        unallocatedChildren -= 1;
      }
    });

    updateSizes(newSizes);
  }, [children, vertical, dividerWidth, updateSizes]);

  const handleResize = useCallback(() => {
    window.requestAnimationFrame(() => {
      const numberOfSections = Object.keys(internalSizes).length;

      if (numberOfSections > 0) {
        const totalSize = vertical
          ? ref.current?.offsetHeight
          : ref.current?.offsetWidth;

        let totalPreviousSize = 0;
        Object.values(internalSizes).forEach((size, index) => {
          totalPreviousSize += (
            size + ((index === numberOfSections - 1) ? 0 : dividerWidth)
          );
        });

        let difference = totalSize - totalPreviousSize;
        if (difference === 0) { return; }
        const newSizes = { ...internalSizes };

        Object.keys(newSizes)
          .sort((a, b) => newSizes[a] - newSizes[b])
          .forEach((key, index) => {
            const averageDiff = difference / (numberOfSections - index);

            // If a section is collapsed don't change it
            if (newSizes[key] !== 0) {
              if (averageDiff > 0) {
                newSizes[key] += averageDiff;
                difference -= averageDiff;
              } else {
                const finalSize = Math.max(newSizes[key] + averageDiff, 0);
                difference += (newSizes[key] - finalSize);
                newSizes[key] = finalSize;
              }
            }
          });

        updateSizes(newSizes);
      }
    });
  }, [dividerWidth, internalSizes, updateSizes, vertical]);

  const handleResizeRef = useRefCallback(handleResize);

  useEffect(() => {
    const element = ref.current;

    const resizeObserver = new ResizeObserver(handleResizeRef);

    resizeObserver.observe(element);

    return () => {
      resizeObserver.unobserve(element);
    };
  }, [handleResizeRef]);

  useEffect(() => {
    if (Object.keys(internalSizes).length > 0) {
      return;
    }
    initializeSize();
  }, [initializeSize, internalSizes]);

  useEffect(() => {
    if (sizes && Object.keys(sizes).length > 0) {
      setInternalSizes(sizes);
    }
  }, [sizes]);

  return (
    <div
      ref={ref}
      className={classNames(
        'hv-resizable',
        { 'hv-resizable--vertical': vertical },
        { [className]: className },
      )}
      {...remainingProps}
    >
      {children.map((child, index) => (
        cloneElement(child, {
          vertical,
          dividerClassName,
          isDisabled: isNullOrUndefined(child.props.isDisabled)
            ? index === children.length - 1
            : child.props.isDisabled,
          changeSize: (size) => handleSizeChange(size, index),
          size: internalSizes[index],
          minSize: getMinSize(child),
          onDragStart,
          onDragEnd,
          dividerWidth,
        })
      ))}
    </div>
  );
}

const ResizableComponent = Resizable;
ResizableComponent.Section = Section;

export default ResizableComponent;
