/*
 * Copyright 2020 The Yorkie Authors. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { logger } from '@yorkie-js-sdk/src/util/logger';
import { TimeTicket } from '@yorkie-js-sdk/src/document/time/ticket';
import { CRDTRoot } from '@yorkie-js-sdk/src/document/crdt/root';
import { RGATreeSplitNodePos } from '@yorkie-js-sdk/src/document/crdt/rga_tree_split';
import { CRDTRichText } from '@yorkie-js-sdk/src/document/crdt/rich_text';
import { Operation } from '@yorkie-js-sdk/src/document/operation/operation';

/**
 *  `StyleOperation` is an operation applies the style of the given range to RichText.
 */
export class StyleOperation extends Operation {
  private fromPos: RGATreeSplitNodePos;
  private toPos: RGATreeSplitNodePos;
  private attributes: Map<string, string>;

  constructor(
    parentCreatedAt: TimeTicket,
    fromPos: RGATreeSplitNodePos,
    toPos: RGATreeSplitNodePos,
    attributes: Map<string, string>,
    executedAt: TimeTicket,
  ) {
    super(parentCreatedAt, executedAt);
    this.fromPos = fromPos;
    this.toPos = toPos;
    this.attributes = attributes;
  }

  /**
   * `create` creates a new instance of StyleOperation.
   */
  public static create(
    parentCreatedAt: TimeTicket,
    fromPos: RGATreeSplitNodePos,
    toPos: RGATreeSplitNodePos,
    attributes: Map<string, string>,
    executedAt: TimeTicket,
  ): StyleOperation {
    return new StyleOperation(
      parentCreatedAt,
      fromPos,
      toPos,
      attributes,
      executedAt,
    );
  }

  /**
   * `execute` executes this operation on the given document(`root`).
   */
  public execute<A>(root: CRDTRoot): void {
    const parentObject = root.findByCreatedAt(this.getParentCreatedAt());
    if (parentObject instanceof CRDTRichText) {
      const text = parentObject as CRDTRichText<A>;
      text.setStyle(
        [this.fromPos, this.toPos],
        this.attributes ? Object.fromEntries(this.attributes) : {},
        this.getExecutedAt(),
      );
    } else {
      if (!parentObject) {
        logger.fatal(`fail to find ${this.getParentCreatedAt()}`);
      }

      logger.fatal(`fail to execute, only RichText can execute edit`);
    }
  }

  /**
   * `getEffectedCreatedAt` returns the creation time of the effected element.
   */
  public getEffectedCreatedAt(): TimeTicket {
    return this.getParentCreatedAt();
  }

  /**
   * `getStructureAsString` returns a string containing the meta data.
   */
  public getStructureAsString(): string {
    const parent = this.getParentCreatedAt().getStructureAsString();
    const fromPos = this.fromPos.getStructureAsString();
    const toPos = this.toPos.getStructureAsString();
    const attributes = this.attributes;
    return `${parent}.STYL(${fromPos},${toPos},${JSON.stringify(attributes)})`;
  }

  /**
   * `getFromPos` returns the start point of the editing range.
   */
  public getFromPos(): RGATreeSplitNodePos {
    return this.fromPos;
  }

  /**
   * `getToPos` returns the end point of the editing range.
   */
  public getToPos(): RGATreeSplitNodePos {
    return this.toPos;
  }

  /**
   * `getAttributes` returns the attributes of this operation.
   */
  public getAttributes(): Map<string, string> {
    return this.attributes;
  }
}
